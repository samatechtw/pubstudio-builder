export const parseCsvRow = (rowStr: string, splitChar: string): string[] => {
  let row: string[]
  if (splitChar === ',') {
    row = rowStr.split(splitChar)
  } else {
    row = rowStr.slice(1, rowStr.length - 1).split(splitChar)
  }
  return row.map((item) => item.trim())
}

export const getSplitChar = (row1: string): string => {
  if (row1.charAt(0) === '"' && row1.charAt(row1.length - 1)) {
    return '","'
  }
  return ','
}
