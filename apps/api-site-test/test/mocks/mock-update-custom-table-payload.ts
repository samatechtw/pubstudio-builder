import { IUpdateTableApiRequest } from '@pubstudio/shared/type-api-site-custom-data'

export const mockUpdateTablePayload = (
  tableName: string | undefined,
): IUpdateTableApiRequest => {
  return {
    old_name: tableName as string,
    events: [],
  }
}
