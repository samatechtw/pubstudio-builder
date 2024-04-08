export const mockAddColumnPayload1 = () => {
  return {
    table_name: 'contact_form',
    column: {
      phone: {
        data_type: 'TEXT',
        validation_rules: [
          {
            rule_type: 'MaxLength',
            parameter: 10,
          },
        ],
      },
    },
  }
}
