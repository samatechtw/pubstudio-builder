export const formatRow = (row: string[]): string => {
  const rowString = row.join('","')
  return `"${rowString}"\n`
}
