import { ICreateTableApiRequest } from '@pubstudio/shared/type-api-site-custom-data'

export const mockCreateTablePayload = (
  tableName: string | undefined,
): ICreateTableApiRequest => {
  return {
    table_name: tableName as string,
    columns: {
      name: {
        name: 'name',
        default: 'name-default',
        data_type: 'TEXT',
        validation_rules: [
          {
            rule_type: 'Unique',
          },
        ],
      },
      phone: {
        name: 'phone',
        data_type: 'TEXT',
        validation_rules: [
          {
            rule_type: 'MinLength',
            parameter: 1,
          },
          {
            rule_type: 'MaxLength',
            parameter: 3,
          },
        ],
      },
    },
    events: [],
  }
}
