use validator::ValidationError;

pub fn validate_from_to(from: i32, to: i32) -> Result<(), ValidationError> {
    if from > to {
        return Err(ValidationError::new("to cannot be greater than from"));
    }
    Ok(())
}
