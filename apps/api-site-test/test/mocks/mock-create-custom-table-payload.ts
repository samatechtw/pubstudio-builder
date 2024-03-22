export const mockCreateTablePayload = (tableName: string) => {
  return JSON.parse(`{
    "table_name": "${tableName}",
    "columns": {
      "name": {
        "data_type": "TEXT",
        "validation_rules": [
          {
            "rule_type": "Unique"
          }
        ]
      },
      "phone": {
        "data_type": "TEXT",
        "validation_rules": [
          {
            "rule_type": "MinLength",
            "parameter": 1
          },
          {
            "rule_type": "MaxLength",
            "parameter": 3
          }
        ]
      }
    }
  }`)
}
