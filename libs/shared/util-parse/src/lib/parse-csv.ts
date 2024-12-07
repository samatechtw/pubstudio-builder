export const parseCsvRow = (rowStr: string): string[] => {
  const str = rowStr.trim()
  const arr: string[] = []
  let quote = false // 'true' means we're inside a quoted field

  // Iterate over each character, keep track of current row and column (of the returned array)
  for (let col = 0, c = 0; c < str.length; c++) {
    const cc = str[c],
      nc = str[c + 1] // Current character, next character
    arr[col] = arr[col] || '' // Create a new column (start with empty string) if necessary

    // If the current character is a quotation mark, and we're inside a
    // quoted field, and the next character is also a quotation mark,
    // add a quotation mark to the current column and skip the next character
    if (cc == '"' && quote && nc == '"') {
      arr[col] += cc
      ++c
      continue
    }

    // If it's just one quotation mark, begin/end quoted field
    if (cc == '"') {
      quote = !quote
      continue
    }

    // If it's a comma and we're not in a quoted field, move on to the next column
    if (cc == ',' && !quote) {
      ++col
      continue
    }

    // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
    // and move on to the next row and move to column 0 of that new row
    if (cc == '\r' && nc == '\n' && !quote) {
      ++row
      col = 0
      ++c
      continue
    }

    // If it's a newline (LF or CR) and we're not in a quoted field,
    // move on to the next row and move to column 0 of that new row
    if ((cc == '\n' && !quote) || (cc == '\r' && !quote)) {
      return arr
    }

    // Otherwise, append the current character to the current column
    arr[col] += cc
  }
  return arr
}

export const getSplitChar = (row1: string): string => {
  if (row1.charAt(0) === '"' && row1.charAt(row1.length - 1)) {
    return '","'
  }
  return ','
}
