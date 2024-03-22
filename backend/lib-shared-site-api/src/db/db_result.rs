pub fn list_result<T>(results: Vec<(T, i64)>) -> (Vec<T>, i64) {
    let mut total = 0;
    if let Some(item) = results.first() {
        total = item.1
    }
    let items = results.into_iter().map(|t| t.0).collect();
    return (items, total);
}
