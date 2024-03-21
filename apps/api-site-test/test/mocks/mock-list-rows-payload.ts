export const mockListRowsPayload = (tableName: string, from?: number, to?: number) => {
  return JSON.parse(`
    {
        "table_name": "${tableName}",
        "from": ${from || 1},
        "to": ${to || 10}
    }
    `)
}
