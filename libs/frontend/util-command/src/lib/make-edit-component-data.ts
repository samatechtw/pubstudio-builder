import {
  IEditComponentData,
  IEditComponentFields,
} from '@pubstudio/shared/type-command-data'
import { IComponent } from '@pubstudio/shared/type-site'

export const makeEditComponentData = (
  component: IComponent,
  newFields: IEditComponentFields,
): IEditComponentData => {
  const oldFields: Record<string, unknown> = {}
  for (const key in newFields) {
    oldFields[key] = component[key as keyof IEditComponentFields]
  }
  const data: IEditComponentData = {
    id: component.id,
    new: newFields,
    old: oldFields,
  }

  return data
}
