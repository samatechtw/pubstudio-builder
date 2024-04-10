import { IAddColumnApiRequest } from '@pubstudio/shared/type-api-site-custom-data'

export const mockAddColumnPayload1 = (column_name?: string): IAddColumnApiRequest => {
  return {
    table_name: 'contact_form',
    column: {
      [column_name ?? 'phone']: {
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
