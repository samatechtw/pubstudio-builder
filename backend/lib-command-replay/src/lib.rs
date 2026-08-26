use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use thiserror::Error;

pub const PROTOCOL_VERSION: u16 = 1;
pub const MAX_BATCH_COMMANDS: usize = 1_000;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct AcceptedOperation {
    pub revision: i64,
    pub protocol_version: u16,
    pub batch_id: String,
    pub client_id: String,
    pub base_revision: i64,
    pub commands: Vec<WireCommand>,
    pub author_id: Option<String>,
    pub created_at: String,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct SubmitBatchResponse {
    pub operation: AcceptedOperation,
    pub changed: bool,
    pub duplicate: bool,
    pub content_updated_at: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct OperationsResponse {
    pub current_revision: i64,
    pub operation_floor: i64,
    pub content_updated_at: i64,
    pub operations: Vec<AcceptedOperation>,
    pub snapshot_required: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct CommandBatch {
    pub protocol_version: u16,
    pub batch_id: String,
    pub client_id: String,
    pub base_revision: i64,
    pub commands: Vec<WireCommand>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DocumentSection {
    Name,
    Version,
    Context,
    Defaults,
    Pages,
    PageOrder,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(untagged)]
pub enum PathSegment {
    Key(String),
    Id { id: String },
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ExpectedValue {
    Missing,
    Value { value: Value },
}

/// `Max` merges numeric counters (`context.nextId`) without a precondition so
/// concurrent allocations from several tabs never conflict.
#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MergeStrategy {
    Max,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WireCommand {
    Set {
        section: DocumentSection,
        path: Vec<PathSegment>,
        expected: ExpectedValue,
        value: Value,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        merge: Option<MergeStrategy>,
    },
    Delete {
        section: DocumentSection,
        path: Vec<PathSegment>,
        expected: Value,
    },
    Insert {
        section: DocumentSection,
        path: Vec<PathSegment>,
        item_id: String,
        item: Value,
        after_id: Option<String>,
        before_id: Option<String>,
    },
    Remove {
        section: DocumentSection,
        path: Vec<PathSegment>,
        item_id: String,
        expected: Value,
    },
    Move {
        section: DocumentSection,
        path: Vec<PathSegment>,
        item_id: String,
        expected_after_id: Option<String>,
        expected_before_id: Option<String>,
        after_id: Option<String>,
        before_id: Option<String>,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct StoredSiteDocument {
    pub name: Value,
    pub version: Value,
    pub context: Value,
    pub defaults: Value,
    pub pages: Value,
    pub page_order: Value,
}

impl StoredSiteDocument {
    pub fn from_stored(
        name: String,
        version: String,
        context: &str,
        defaults: &str,
        pages: &str,
        page_order: &str,
    ) -> Result<Self, serde_json::Error> {
        Ok(Self {
            name: Value::String(name),
            version: Value::String(version),
            context: decode_stored_value(context)?,
            defaults: decode_stored_value(defaults)?,
            pages: decode_stored_value(pages)?,
            page_order: decode_stored_value(page_order)?,
        })
    }

    pub fn section(&self, section: &DocumentSection) -> &Value {
        match section {
            DocumentSection::Name => &self.name,
            DocumentSection::Version => &self.version,
            DocumentSection::Context => &self.context,
            DocumentSection::Defaults => &self.defaults,
            DocumentSection::Pages => &self.pages,
            DocumentSection::PageOrder => &self.page_order,
        }
    }

    pub fn section_mut(&mut self, section: &DocumentSection) -> &mut Value {
        match section {
            DocumentSection::Name => &mut self.name,
            DocumentSection::Version => &mut self.version,
            DocumentSection::Context => &mut self.context,
            DocumentSection::Defaults => &mut self.defaults,
            DocumentSection::Pages => &mut self.pages,
            DocumentSection::PageOrder => &mut self.page_order,
        }
    }

    pub fn name_string(&self) -> Result<String, ReplayError> {
        self.name
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| ReplayError::InvalidDocument("name must be a string".into()))
    }

    pub fn version_string(&self) -> Result<String, ReplayError> {
        self.version
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| ReplayError::InvalidDocument("version must be a string".into()))
    }
}

pub fn encode_stored_value(value: &Value) -> Result<String, serde_json::Error> {
    serde_json::to_string(&serde_json::to_string(value)?)
}

fn decode_stored_value(stored: &str) -> Result<Value, serde_json::Error> {
    let outer: Value = serde_json::from_str(stored)?;
    if let Value::String(inner) = outer {
        serde_json::from_str(&inner).or(Ok(Value::String(inner)))
    } else {
        Ok(outer)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct ReplayConflict {
    pub command_index: usize,
    pub section: DocumentSection,
    pub path: Vec<PathSegment>,
    pub reason: String,
    pub current: Option<Value>,
}

#[derive(Debug, Error, PartialEq)]
pub enum ReplayError {
    #[error("unsupported collaboration protocol version {0}")]
    UnsupportedProtocol(u16),
    #[error("a collaboration batch must identify its batch and client")]
    MissingIdentity,
    #[error("a collaboration batch may contain at most {MAX_BATCH_COMMANDS} commands")]
    TooManyCommands,
    #[error("invalid stored site: {0}")]
    InvalidDocument(String),
    #[error("command conflict: {0:?}")]
    Conflict(ReplayConflict),
}

#[derive(Clone, Debug, PartialEq)]
pub struct ReplayResult {
    pub document: StoredSiteDocument,
    pub changed: bool,
}

pub fn replay_batch(
    current: &StoredSiteDocument,
    batch: &CommandBatch,
) -> Result<ReplayResult, ReplayError> {
    if batch.protocol_version != PROTOCOL_VERSION {
        return Err(ReplayError::UnsupportedProtocol(batch.protocol_version));
    }
    if batch.batch_id.trim().is_empty() || batch.client_id.trim().is_empty() {
        return Err(ReplayError::MissingIdentity);
    }
    if batch.commands.len() > MAX_BATCH_COMMANDS {
        return Err(ReplayError::TooManyCommands);
    }

    let mut document = current.clone();
    let mut changed = false;
    for (command_index, command) in batch.commands.iter().enumerate() {
        changed |= apply_command(&mut document, command_index, command)?;
    }
    document.name_string()?;
    document.version_string()?;
    Ok(ReplayResult { document, changed })
}

pub fn has_content_changes(commands: &[WireCommand]) -> bool {
    commands.iter().any(|command| {
        matches!(
            command_section(command),
            DocumentSection::Context
                | DocumentSection::Defaults
                | DocumentSection::Pages
                | DocumentSection::PageOrder
        )
    })
}

pub fn command_section(command: &WireCommand) -> &DocumentSection {
    match command {
        WireCommand::Set { section, .. }
        | WireCommand::Delete { section, .. }
        | WireCommand::Insert { section, .. }
        | WireCommand::Remove { section, .. }
        | WireCommand::Move { section, .. } => section,
    }
}

fn apply_command(
    document: &mut StoredSiteDocument,
    command_index: usize,
    command: &WireCommand,
) -> Result<bool, ReplayError> {
    match command {
        WireCommand::Set {
            section,
            path,
            expected,
            value,
            merge,
        } => apply_set(
            document,
            command_index,
            section,
            path,
            expected,
            value,
            *merge,
        ),
        WireCommand::Delete {
            section,
            path,
            expected,
        } => apply_delete(document, command_index, section, path, expected),
        WireCommand::Insert {
            section,
            path,
            item_id,
            item,
            after_id,
            before_id,
        } => {
            let array = resolve_array_mut(document, command_index, section, path)?;
            if let Some(index) = find_item(array, item_id) {
                return if &array[index] == item {
                    Ok(false)
                } else {
                    Err(conflict(
                        command_index,
                        section,
                        path,
                        "an item with the new ID already exists with different data",
                        Some(array[index].clone()),
                    ))
                };
            }
            let index = insertion_index(array, after_id.as_deref(), before_id.as_deref())
                .ok_or_else(|| {
                    conflict(
                        command_index,
                        section,
                        path,
                        "the insertion anchors no longer exist",
                        Some(Value::Array(array.clone())),
                    )
                })?;
            array.insert(index, item.clone());
            Ok(true)
        }
        WireCommand::Remove {
            section,
            path,
            item_id,
            expected,
        } => {
            let array = resolve_array_mut(document, command_index, section, path)?;
            let Some(index) = find_item(array, item_id) else {
                return Ok(false);
            };
            if &array[index] != expected {
                return Err(conflict(
                    command_index,
                    section,
                    path,
                    "the removed item changed",
                    Some(array[index].clone()),
                ));
            }
            array.remove(index);
            Ok(true)
        }
        WireCommand::Move {
            section,
            path,
            item_id,
            expected_after_id,
            expected_before_id,
            after_id,
            before_id,
        } => apply_move(
            document,
            command_index,
            section,
            path,
            item_id,
            expected_after_id.as_deref(),
            expected_before_id.as_deref(),
            after_id.as_deref(),
            before_id.as_deref(),
        ),
    }
}

fn apply_set(
    document: &mut StoredSiteDocument,
    command_index: usize,
    section: &DocumentSection,
    path: &[PathSegment],
    expected: &ExpectedValue,
    value: &Value,
    merge: Option<MergeStrategy>,
) -> Result<bool, ReplayError> {
    if path.is_empty() {
        let current = document.section(section);
        let value = &merge_value(Some(current), value, merge);
        if current == value {
            return Ok(false);
        }
        if merge.is_none() && !expected_matches(Some(current), expected) {
            return Err(conflict(
                command_index,
                section,
                path,
                "the scalar value changed",
                Some(current.clone()),
            ));
        }
        *document.section_mut(section) = value.clone();
        return Ok(true);
    }

    let (parent_path, last) = path.split_at(path.len() - 1);
    let parent = resolve_mut(document.section_mut(section), parent_path).ok_or_else(|| {
        conflict(
            command_index,
            section,
            path,
            "the parent path no longer exists",
            None,
        )
    })?;
    let last = &last[0];
    let current = child(parent, last).cloned();
    let value = merge_value(current.as_ref(), value, merge);
    if current.as_ref() == Some(&value) {
        return Ok(false);
    }
    if merge.is_none() && !expected_matches(current.as_ref(), expected) {
        return Err(conflict(
            command_index,
            section,
            path,
            "the scalar value changed",
            current,
        ));
    }
    set_child(parent, last, value)
        .map_err(|reason| conflict(command_index, section, path, reason, current))?;
    Ok(true)
}

fn apply_delete(
    document: &mut StoredSiteDocument,
    command_index: usize,
    section: &DocumentSection,
    path: &[PathSegment],
    expected: &Value,
) -> Result<bool, ReplayError> {
    if path.is_empty() {
        return Err(ReplayError::InvalidDocument(
            "a document section cannot be deleted".into(),
        ));
    }
    let (parent_path, last) = path.split_at(path.len() - 1);
    let parent = resolve_mut(document.section_mut(section), parent_path).ok_or_else(|| {
        conflict(
            command_index,
            section,
            path,
            "the parent path no longer exists",
            None,
        )
    })?;
    let last = &last[0];
    let Some(current) = child(parent, last).cloned() else {
        return Ok(false);
    };
    if &current != expected {
        return Err(conflict(
            command_index,
            section,
            path,
            "the deleted value changed",
            Some(current),
        ));
    }
    delete_child(parent, last)
        .map_err(|reason| conflict(command_index, section, path, reason, Some(current)))?;
    Ok(true)
}

#[allow(clippy::too_many_arguments)]
fn apply_move(
    document: &mut StoredSiteDocument,
    command_index: usize,
    section: &DocumentSection,
    path: &[PathSegment],
    item_id: &str,
    expected_after_id: Option<&str>,
    expected_before_id: Option<&str>,
    after_id: Option<&str>,
    before_id: Option<&str>,
) -> Result<bool, ReplayError> {
    let array = resolve_array_mut(document, command_index, section, path)?;
    let Some(index) = find_item(array, item_id) else {
        return Err(conflict(
            command_index,
            section,
            path,
            "the moved item no longer exists",
            None,
        ));
    };
    if item_has_anchors(array, index, after_id, before_id) {
        return Ok(false);
    }
    if !item_has_anchors(array, index, expected_after_id, expected_before_id) {
        return Err(conflict(
            command_index,
            section,
            path,
            "the moved item is no longer at its expected position",
            Some(Value::Array(array.clone())),
        ));
    }

    let item = array.remove(index);
    let destination = insertion_index(array, after_id, before_id).ok_or_else(|| {
        conflict(
            command_index,
            section,
            path,
            "the destination anchors no longer exist",
            Some(Value::Array(array.clone())),
        )
    })?;
    array.insert(destination, item);
    Ok(true)
}

fn resolve_array_mut<'a>(
    document: &'a mut StoredSiteDocument,
    command_index: usize,
    section: &DocumentSection,
    path: &[PathSegment],
) -> Result<&'a mut Vec<Value>, ReplayError> {
    let value = resolve_mut(document.section_mut(section), path).ok_or_else(|| {
        conflict(
            command_index,
            section,
            path,
            "the array path no longer exists",
            None,
        )
    })?;
    if !value.is_array() {
        return Err(conflict(
            command_index,
            section,
            path,
            "the target is not an array",
            Some(value.clone()),
        ));
    }
    Ok(value.as_array_mut().expect("array checked above"))
}

fn resolve_mut<'a>(mut value: &'a mut Value, path: &[PathSegment]) -> Option<&'a mut Value> {
    for segment in path {
        value = match segment {
            PathSegment::Key(key) => value.as_object_mut()?.get_mut(key)?,
            PathSegment::Id { id } => {
                let array = value.as_array_mut()?;
                let index = find_item(array, id)?;
                array.get_mut(index)?
            }
        };
    }
    Some(value)
}

fn child<'a>(parent: &'a Value, segment: &PathSegment) -> Option<&'a Value> {
    match segment {
        PathSegment::Key(key) => parent.as_object()?.get(key),
        PathSegment::Id { id } => parent.as_array()?.iter().find(|item| item_id(item) == *id),
    }
}

fn set_child(parent: &mut Value, segment: &PathSegment, value: Value) -> Result<(), &'static str> {
    match segment {
        PathSegment::Key(key) => {
            let map = parent
                .as_object_mut()
                .ok_or("a property parent is not an object")?;
            map.insert(key.clone(), value);
            Ok(())
        }
        PathSegment::Id { id } => {
            let array = parent
                .as_array_mut()
                .ok_or("an ID selector parent is not an array")?;
            let index = find_item(array, id).ok_or("the selected item no longer exists")?;
            array[index] = value;
            Ok(())
        }
    }
}

fn delete_child(parent: &mut Value, segment: &PathSegment) -> Result<(), &'static str> {
    match segment {
        PathSegment::Key(key) => {
            let map: &mut Map<String, Value> = parent
                .as_object_mut()
                .ok_or("a property parent is not an object")?;
            map.remove(key);
            Ok(())
        }
        PathSegment::Id { id } => {
            let array = parent
                .as_array_mut()
                .ok_or("an ID selector parent is not an array")?;
            let index = find_item(array, id).ok_or("the selected item no longer exists")?;
            array.remove(index);
            Ok(())
        }
    }
}

fn merge_value(current: Option<&Value>, value: &Value, merge: Option<MergeStrategy>) -> Value {
    match (merge, current.and_then(Value::as_f64), value.as_f64()) {
        (Some(MergeStrategy::Max), Some(current_number), Some(requested)) => {
            if current_number >= requested {
                current.cloned().unwrap_or_else(|| value.clone())
            } else {
                value.clone()
            }
        }
        _ => value.clone(),
    }
}

fn expected_matches(current: Option<&Value>, expected: &ExpectedValue) -> bool {
    match expected {
        ExpectedValue::Missing => current.is_none(),
        ExpectedValue::Value { value } => current == Some(value),
    }
}

fn item_id(value: &Value) -> String {
    match value {
        Value::Object(map) => map
            .get("id")
            .and_then(Value::as_str)
            .map(str::to_owned)
            .unwrap_or_else(|| canonical_value(value)),
        Value::String(value) => value.clone(),
        _ => canonical_value(value),
    }
}

fn canonical_value(value: &Value) -> String {
    serde_json::to_string(value).unwrap_or_default()
}

fn find_item(array: &[Value], id: &str) -> Option<usize> {
    array.iter().position(|item| item_id(item) == id)
}

fn insertion_index(
    array: &[Value],
    after_id: Option<&str>,
    before_id: Option<&str>,
) -> Option<usize> {
    if let Some(before_id) = before_id {
        if let Some(index) = find_item(array, before_id) {
            return Some(index);
        }
    }
    if let Some(after_id) = after_id {
        if let Some(index) = find_item(array, after_id) {
            return Some(index + 1);
        }
    }
    if after_id.is_none() && before_id.is_none() {
        return Some(array.len());
    }
    None
}

fn item_has_anchors(
    array: &[Value],
    index: usize,
    after_id: Option<&str>,
    before_id: Option<&str>,
) -> bool {
    let actual_after = index
        .checked_sub(1)
        .and_then(|previous| array.get(previous))
        .map(item_id);
    let actual_before = array.get(index + 1).map(item_id);
    actual_after.as_deref() == after_id && actual_before.as_deref() == before_id
}

fn conflict(
    command_index: usize,
    section: &DocumentSection,
    path: &[PathSegment],
    reason: impl Into<String>,
    current: Option<Value>,
) -> ReplayError {
    ReplayError::Conflict(ReplayConflict {
        command_index,
        section: section.clone(),
        path: path.to_vec(),
        reason: reason.into(),
        current,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::{fs, path::PathBuf};

    #[derive(Deserialize)]
    struct ReplayFixture {
        name: String,
        initial: StoredSiteDocument,
        batch: CommandBatch,
        expected: Option<StoredSiteDocument>,
        changed: Option<bool>,
        conflict: Option<FixtureConflict>,
    }

    #[derive(Deserialize)]
    struct FixtureConflict {
        command_index: usize,
        reason: String,
    }

    fn document() -> StoredSiteDocument {
        StoredSiteDocument {
            name: json!("Site"),
            version: json!("3"),
            context: json!({"theme": {"colors": {"primary": "red"}}}),
            defaults: json!({"homePage": "/"}),
            pages: json!({"/": {"root": {"id": "root", "children": [
                {"id": "a", "content": "A"},
                {"id": "b", "content": "B"}
            ]}}}),
            page_order: json!(["/"]),
        }
    }

    #[test]
    fn replays_the_language_neutral_fixture_corpus() {
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../../fixtures/collaboration/replay.json");
        let fixtures: Vec<ReplayFixture> =
            serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap();
        for fixture in fixtures {
            match (
                replay_batch(&fixture.initial, &fixture.batch),
                fixture.conflict,
            ) {
                (Ok(result), None) => {
                    assert_eq!(
                        result.document,
                        fixture.expected.unwrap(),
                        "{}",
                        fixture.name
                    );
                    assert_eq!(
                        result.changed,
                        fixture.changed.unwrap_or(true),
                        "{}",
                        fixture.name
                    );
                }
                (Err(ReplayError::Conflict(actual)), Some(expected)) => {
                    assert_eq!(
                        actual.command_index, expected.command_index,
                        "{}",
                        fixture.name
                    );
                    assert_eq!(actual.reason, expected.reason, "{}", fixture.name);
                }
                (result, _) => panic!("unexpected fixture result for {}: {result:?}", fixture.name),
            }
        }
    }

    #[test]
    fn decodes_and_encodes_the_existing_string_wrapped_storage_format() {
        let encoded = encode_stored_value(&json!({"value": 1})).unwrap();
        assert_eq!(encoded, r#""{\"value\":1}""#);
        let document = StoredSiteDocument::from_stored(
            "Site".into(),
            "3".into(),
            &encoded,
            r#""{}""#,
            r#""{}""#,
            r#""[]""#,
        )
        .unwrap();
        assert_eq!(document.context, json!({"value": 1}));
    }

    fn batch(commands: Vec<WireCommand>) -> CommandBatch {
        CommandBatch {
            protocol_version: PROTOCOL_VERSION,
            batch_id: "batch-1".into(),
            client_id: "client-1".into(),
            base_revision: 0,
            commands,
        }
    }

    #[test]
    fn merges_non_overlapping_stale_scalar_edits() {
        let first = WireCommand::Set {
            section: DocumentSection::Name,
            path: vec![],
            expected: ExpectedValue::Value {
                value: json!("Site"),
            },
            value: json!("Renamed"),
            merge: None,
        };
        let second = WireCommand::Set {
            section: DocumentSection::Context,
            path: vec!["theme".into(), "colors".into(), "primary".into()],
            expected: ExpectedValue::Value {
                value: json!("red"),
            },
            value: json!("blue"),
            merge: None,
        };
        let after_first = replay_batch(&document(), &batch(vec![first]))
            .unwrap()
            .document;
        let merged = replay_batch(&after_first, &batch(vec![second]))
            .unwrap()
            .document;
        assert_eq!(merged.name, json!("Renamed"));
        assert_eq!(merged.context["theme"]["colors"]["primary"], json!("blue"));
    }

    #[test]
    fn reports_a_structured_scalar_conflict_atomically() {
        let commands = vec![
            WireCommand::Set {
                section: DocumentSection::Name,
                path: vec![],
                expected: ExpectedValue::Value {
                    value: json!("Site"),
                },
                value: json!("Renamed"),
                merge: None,
            },
            WireCommand::Set {
                section: DocumentSection::Context,
                path: vec!["theme".into(), "colors".into(), "primary".into()],
                expected: ExpectedValue::Value {
                    value: json!("green"),
                },
                value: json!("blue"),
                merge: None,
            },
        ];
        let error = replay_batch(&document(), &batch(commands)).unwrap_err();
        let ReplayError::Conflict(detail) = error else {
            panic!("expected conflict")
        };
        assert_eq!(detail.command_index, 1);
        assert_eq!(detail.current, Some(json!("red")));
        assert_eq!(document().name, json!("Site"));
    }

    #[test]
    fn treats_requested_results_as_idempotent() {
        let command = WireCommand::Set {
            section: DocumentSection::Name,
            path: vec![],
            expected: ExpectedValue::Value {
                value: json!("Old"),
            },
            value: json!("Site"),
            merge: None,
        };
        assert!(
            !replay_batch(&document(), &batch(vec![command]))
                .unwrap()
                .changed
        );
    }

    #[test]
    fn inserts_by_stable_component_anchors() {
        let command = WireCommand::Insert {
            section: DocumentSection::Pages,
            path: vec!["/".into(), "root".into(), "children".into()],
            item_id: "c".into(),
            item: json!({"id": "c", "content": "C"}),
            after_id: Some("a".into()),
            before_id: Some("b".into()),
        };
        let output = replay_batch(&document(), &batch(vec![command]))
            .unwrap()
            .document;
        let ids: Vec<_> = output.pages["/"]["root"]["children"]
            .as_array()
            .unwrap()
            .iter()
            .map(item_id)
            .collect();
        assert_eq!(ids, vec!["a", "c", "b"]);
    }

    #[test]
    fn resolves_nested_components_by_id_instead_of_index() {
        let command = WireCommand::Set {
            section: DocumentSection::Pages,
            path: vec![
                "/".into(),
                "root".into(),
                "children".into(),
                PathSegment::Id { id: "b".into() },
                "content".into(),
            ],
            expected: ExpectedValue::Value { value: json!("B") },
            value: json!("Updated"),
            merge: None,
        };
        let mut changed = document();
        changed.pages["/"]["root"]["children"]
            .as_array_mut()
            .unwrap()
            .insert(0, json!({"id": "new", "content": "new"}));
        let output = replay_batch(&changed, &batch(vec![command]))
            .unwrap()
            .document;
        assert_eq!(
            output.pages["/"]["root"]["children"][2]["content"],
            json!("Updated")
        );
    }

    #[test]
    fn moves_only_from_the_expected_position() {
        let command = WireCommand::Move {
            section: DocumentSection::Pages,
            path: vec!["/".into(), "root".into(), "children".into()],
            item_id: "a".into(),
            expected_after_id: None,
            expected_before_id: Some("b".into()),
            after_id: Some("b".into()),
            before_id: None,
        };
        let output = replay_batch(&document(), &batch(vec![command.clone()]))
            .unwrap()
            .document;
        let ids: Vec<_> = output.pages["/"]["root"]["children"]
            .as_array()
            .unwrap()
            .iter()
            .map(item_id)
            .collect();
        assert_eq!(ids, vec!["b", "a"]);
        assert!(
            !replay_batch(&output, &batch(vec![command]))
                .unwrap()
                .changed
        );
    }

    impl From<&str> for PathSegment {
        fn from(value: &str) -> Self {
            Self::Key(value.into())
        }
    }
}
