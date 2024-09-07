import { IAddColumnApiRequest } from '@pubstudio/shared/type-api-site-custom-data'

export const mockAddColumnPayload1 = (column_name?: string): IAddColumnApiRequest => {
  const name = column_name ?? 'phone'
  return {
    table_name: 'contact_form',
    column: {
      [name]: {
        name,
        default: 'test-default',
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
