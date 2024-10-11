use validator::ValidationError;

pub fn validate_from_to(from: i32, to: i32) -> Result<(), ValidationError> {
    if from > to {
        return Err(ValidationError::new("to cannot be greater than from"));
    }
    Ok(())
}

pub fn validate_vec_item_lengths(
    items: &Vec<String>,
    min: usize,
    max: usize,
) -> Result<(), ValidationError> {
    for item in items.into_iter() {
        if item.len() < min || item.len() > max {
            return Err(ValidationError::new("array item length"));
        }
    }
    Ok(())
}
