use std::{fs, io, time::Duration};

use axum::{http::Request, response::Response, Router};
use file_rotate::{
    compression::Compression,
    suffix::{AppendTimestamp, DateFrom, FileLimit},
    ContentLimit, FileRotate, TimeFrequency,
};
use tower_http::{classify::ServerErrorsFailureClass, trace::TraceLayer};
use tracing::{field, info, Span};

use tracing_appender::non_blocking::{NonBlocking, WorkerGuard};
use tracing_core::field::display;
use tracing_subscriber::{
    prelude::__tracing_subscriber_SubscriberExt, util::SubscriberInitExt, EnvFilter,
};

use crate::{
    layer::{
        slack_layer::{SlackLayer, SlackLayerParams},
        worker::SlackBackgroundWorker,
    },
    util::log_format::{Logger, LoggerFields},
};

fn init_nonblocking_layer(crate_name: &str) -> (NonBlocking, WorkerGuard) {
    if let Err(err) = fs::create_dir("logs") {
        println!("'logs' directory already existed: {}", err);
    }

    // Define the log file rotation configuration
    let appender = FileRotate::new(
        format!("./logs/{}_log", crate_name), // Base log file name
        AppendTimestamp::with_format(
            "%y-%m-%d-%H",
            FileLimit::Age(chrono::Duration::days(14)),
            DateFrom::Now,
        ),
        ContentLimit::Time(TimeFrequency::Daily), // Rotate daily
        Compression::None, // Optional compression method (None for no compression)
        #[cfg(unix)]
        None,
    );

    // Create a non-blocking writer
    let (non_blocking, guard) = tracing_appender::non_blocking(appender);

    (non_blocking, guard)
}

fn init_filter_layer(crate_name: &str) -> EnvFilter {
    let default_filter = format!(
        "{}=debug,lib_shared_site_api=debug,tower_http=debug,axum::rejection=trace",
        crate_name
    );
    tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| default_filter.into())
}

pub fn setup_logging(crate_name: &str) -> WorkerGuard {
    let (non_blocking, guard) = init_nonblocking_layer(crate_name);

    tracing_subscriber::registry()
        .with(init_filter_layer(crate_name))
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .event_format(Logger::new(crate_name))
                .fmt_fields(LoggerFields::new()),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_writer(io::stdout)
                .with_writer(non_blocking),
        )
        .init();

    guard
}

pub fn setup_slack_logging(
    crate_name: &str,
    slack_info_url: &str,
    slack_error_url: &str,
) -> (WorkerGuard, SlackBackgroundWorker) {
    let (non_blocking, guard) = init_nonblocking_layer(crate_name);

    let slack_params = SlackLayerParams {
        info_url: slack_info_url.into(),
        error_url: slack_error_url.into(),
    };
    let (slack_layer, slack_worker) = SlackLayer::new(slack_params);

    tracing_subscriber::registry()
        .with(init_filter_layer(crate_name))
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .event_format(Logger::new(crate_name))
                .fmt_fields(LoggerFields::new()),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_writer(io::stdout)
                .with_writer(non_blocking),
        )
        .with(slack_layer)
        .init();

    (guard, slack_worker)
}

pub fn create_trace_layer(app: Router) -> Router {
    app.layer(
        TraceLayer::new_for_http()
            .make_span_with(|_req: &Request<_>| {
                tracing::info_span!(
                    "Request",
                    METHOD = field::Empty,
                    PATH = field::Empty,
                    t = field::Empty,
                    s = field::Empty
                )
            })
            .on_request(|req: &Request<_>, span: &Span| {
                span.record("METHOD", &display(req.method().to_string()));
                span.record("PATH", &display(req.uri().path()));
            })
            .on_response(|res: &Response, latency: Duration, span: &Span| {
                span.record("t", &display(format!("{}ms", latency.as_millis())));
                span.record("s", res.status().as_u16());
                info!("")
            })
            .on_failure(
                |_error: ServerErrorsFailureClass, _latency: Duration, _span: &Span| {
                    // Handling in `on_response` for now
                },
            ),
    )
}
