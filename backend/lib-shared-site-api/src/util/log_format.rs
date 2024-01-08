use chrono::{DateTime, Utc};
use std::{
    borrow::Cow,
    fmt::{self, Display},
};
use tracing::span;
use tracing_core::{
    field::{self, Field},
    Event, Level, Subscriber,
};

use nu_ansi_term::{Color, Style};
use tracing_subscriber::{
    field::{MakeVisitor, VisitFmt, VisitOutput},
    fmt::{format::Writer, FmtContext, FormatEvent, FormatFields, FormattedFields},
    prelude::__tracing_subscriber_field_RecordFields,
    registry::{LookupSpan, Scope},
};

/// Renders an error into a list of sources, *including* the error
struct ErrorSourceList<'a>(&'a (dyn std::error::Error + 'static));

impl<'a> Display for ErrorSourceList<'a> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut list = f.debug_list();
        let mut curr = Some(self.0);
        while let Some(curr_err) = curr {
            list.entry(&format_args!("{}", curr_err));
            curr = curr_err.source();
        }
        list.finish()
    }
}

/// </pre>
#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Logger {
    display_location: bool,
    is_ansi: bool,
    label: String,
}

#[derive(Debug)]
pub struct FmtVisitor<'a> {
    writer: Writer<'a>,
    is_empty: bool,
    style: Style,
    result: fmt::Result,
}

#[derive(Debug)]
pub struct LoggerFields {}

impl Default for Logger {
    fn default() -> Self {
        Self {
            display_location: true,
            is_ansi: true,
            label: "log".to_string(),
        }
    }
}

impl Logger {
    pub fn new(label: &str) -> Self {
        Self {
            display_location: true,
            is_ansi: true,
            label: label.to_string(),
        }
    }
    fn style_for(level: &Level) -> Style {
        match *level {
            Level::TRACE => Style::new().fg(Color::Purple),
            Level::DEBUG => Style::new().fg(Color::Blue),
            Level::INFO => Style::new().fg(Color::Green),
            Level::WARN => Style::new().fg(Color::Yellow),
            Level::ERROR => Style::new().fg(Color::Red),
        }
    }
}

const TRACE_STR: &'static str = "TRACE";
const DEBUG_STR: &'static str = " DEBUG";
const INFO_STR: &'static str = " INFO";
const WARN_STR: &'static str = " WARN";
const ERROR_STR: &'static str = " ERROR";

fn format_level(w: &mut Writer, level: Level, ansi: bool) {
    let _ = if ansi {
        match level {
            Level::TRACE => write!(w, "{} ", Color::Purple.paint(TRACE_STR)),
            Level::DEBUG => write!(w, "{} ", Color::Blue.paint(DEBUG_STR)),
            Level::INFO => write!(w, "{} ", Color::Green.paint(INFO_STR)),
            Level::WARN => write!(w, "{} ", Color::Yellow.paint(WARN_STR)),
            Level::ERROR => write!(w, "{} ", Color::Red.paint(ERROR_STR)),
        }
    } else {
        match level {
            Level::TRACE => write!(w, "{} ", TRACE_STR),
            Level::DEBUG => write!(w, "{} ", DEBUG_STR),
            Level::INFO => write!(w, "{} ", INFO_STR),
            Level::WARN => write!(w, "{} ", WARN_STR),
            Level::ERROR => write!(w, "{} ", ERROR_STR),
        }
    };
}

fn basename<'a>(path: &'a str) -> Cow<'a, str> {
    let mut pieces = path.rsplit('/');
    match pieces.next() {
        Some(p) => p.into(),
        None => path.into(),
    }
}

impl<S, N> FormatEvent<S, N> for Logger
where
    S: Subscriber + for<'a> LookupSpan<'a>,
    N: for<'a> FormatFields<'a> + 'static,
{
    fn format_event(
        &self,
        ctx: &FmtContext<'_, S, N>,
        mut writer: Writer<'_>,
        event: &Event<'_>,
    ) -> fmt::Result {
        let has_ansi_escapes = writer.has_ansi_escapes();
        let meta = event.metadata();
        write!(&mut writer, "  ")?;

        let now: DateTime<Utc> = Utc::now();
        write!(writer, "{}", now.format("%Y-%m-%d %H:%M:%S%.3f"))?;

        let style = if writer.has_ansi_escapes() {
            Logger::style_for(meta.level())
        } else {
            Style::new()
        };

        format_level(&mut writer, *meta.level(), has_ansi_escapes);

        let target_style = if has_ansi_escapes {
            style.bold()
        } else {
            style
        };
        // TODO -- only print self.label in prod
        write!(
            writer,
            "{}{}{}:",
            target_style.prefix(),
            basename(meta.file().unwrap_or("?")),
            target_style.infix(style)
        )?;
        let line_number = meta.line();

        if let Some(line) = line_number {
            write!(writer, "{}{}{}:", style.prefix(), line, style.infix(style))?;
        }

        writer.write_char(' ')?;

        let mut v = FmtVisitor::new(writer.by_ref(), true).with_style(style);
        event.record(&mut v);
        v.finish()?;

        for span in ctx.event_scope().into_iter().flat_map(Scope::from_root) {
            let exts = span.extensions();
            if let Some(fields) = exts.get::<FormattedFields<N>>() {
                if !fields.is_empty() {
                    write!(writer, "{}", &fields.fields)?;
                }
            }
        }

        writer.write_char('\n')
    }
}

impl<'writer> FormatFields<'writer> for Logger {
    fn format_fields<R: __tracing_subscriber_field_RecordFields>(
        &self,
        writer: Writer<'writer>,
        fields: R,
    ) -> fmt::Result {
        let mut v = FmtVisitor::new(writer, true);
        fields.record(&mut v);
        v.finish()
    }

    fn add_fields(
        &self,
        current: &'writer mut FormattedFields<Self>,
        fields: &span::Record<'_>,
    ) -> fmt::Result {
        let empty = current.is_empty();
        let writer = current.as_writer();
        let mut v = FmtVisitor::new(writer, empty);
        fields.record(&mut v);
        v.finish()
    }
}

impl LoggerFields {
    /// Returns a new default [`LoggerFields`] implementation.
    pub fn new() -> Self {
        // By default, don't override the `Writer`'s ANSI colors
        // configuration. We'll only do this if the user calls the
        // deprecated `LoggerFields::with_ansi` method.
        Self {}
    }
}

impl<'a> MakeVisitor<Writer<'a>> for LoggerFields {
    type Visitor = FmtVisitor<'a>;

    #[inline]
    fn make_visitor(&self, target: Writer<'a>) -> Self::Visitor {
        FmtVisitor::new(target, true)
    }
}

impl<'a> FmtVisitor<'a> {
    pub fn new(writer: Writer<'a>, is_empty: bool) -> Self {
        Self {
            writer,
            is_empty,
            style: Style::default(),
            result: Ok(()),
        }
    }

    pub(crate) fn with_style(self, style: Style) -> Self {
        Self { style, ..self }
    }

    fn write_padded(&mut self, value: &impl fmt::Debug) {
        let padding = if self.is_empty {
            self.is_empty = false;
            ""
        } else {
            ", "
        };
        self.result = write!(self.writer, "{}{:?}", padding, value);
    }

    fn bold(&self) -> Style {
        if self.writer.has_ansi_escapes() {
            self.style.bold()
        } else {
            Style::new()
        }
    }
}

impl<'a> field::Visit for FmtVisitor<'a> {
    fn record_str(&mut self, field: &Field, value: &str) {
        if self.result.is_err() {
            return;
        }
        self.record_debug(field, &value)
    }

    fn record_u64(&mut self, field: &Field, value: u64) {
        if self.result.is_err() {
            return;
        }
        if field.name() == "s" {
            let style = self.bold().fg(match value {
                200..=299 => Color::Green,
                400..=499 => Color::Red,
                500 => Color::Magenta,
                _ => Color::LightGray,
            });
            return self.record_debug(
                field,
                &format_args!("{}{}{}", style.prefix(), value, style.infix(self.style),),
            );
        }
        self.record_debug(field, &value)
    }

    fn record_error(&mut self, field: &Field, value: &(dyn std::error::Error + 'static)) {
        if let Some(source) = value.source() {
            let bold = self.bold();
            self.record_debug(
                field,
                &format_args!(
                    "{}, {}{}.sources{}: {}",
                    value,
                    bold.prefix(),
                    field,
                    bold.infix(self.style),
                    ErrorSourceList(source),
                ),
            )
        } else {
            self.record_debug(field, &format_args!("{}", value))
        }
    }

    fn record_debug(&mut self, field: &Field, value: &dyn fmt::Debug) {
        if self.result.is_err() {
            return;
        }
        let bold = self.bold();
        match field.name() {
            "message" | "s" => {
                self.write_padded(&format_args!("{}{:?}", self.style.prefix(), value,))
            }
            "" => {}
            // Skip fields that are actually log metadata that have already been handled
            name if name.starts_with("log.") => self.result = Ok(()),
            name if name.starts_with("r#") => self.write_padded(&format_args!(
                "{}{}{}: {:?}",
                bold.prefix(),
                &name[2..],
                bold.infix(self.style),
                value
            )),
            name if name.starts_with("SKIP") => self.write_padded(&format_args!(
                "{}{:?}{}",
                bold.prefix(),
                value,
                bold.infix(self.style),
            )),
            name => self.write_padded(&format_args!(
                "{}={}{:?}{}",
                name,
                bold.prefix(),
                value,
                bold.infix(self.style),
            )),
        };
    }
}

impl<'a> VisitOutput<fmt::Result> for FmtVisitor<'a> {
    fn finish(mut self) -> fmt::Result {
        write!(&mut self.writer, "{}", self.style.suffix())?;
        self.result
    }
}

impl<'a> VisitFmt for FmtVisitor<'a> {
    fn writer(&mut self) -> &mut dyn fmt::Write {
        &mut self.writer
    }
}
