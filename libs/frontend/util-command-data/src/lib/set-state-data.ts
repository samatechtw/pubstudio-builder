import { ISetComponentStateData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentState } from '@pubstudio/shared/type-site'

// Add, rename, update or remove a component state entry.
// `oldKey` undefined adds; `newKey` undefined removes; both set renames or updates.
export const makeSetStateData = (
  component: IComponent,
  oldKey: string | undefined,
  newKey: string | undefined,
  newVal: IComponentState | undefined,
): ISetComponentStateData | undefined => {
  const oldVal = oldKey === undefined ? undefined : component.state?.[oldKey]
  if (oldKey !== undefined && oldVal === undefined) {
    return undefined
  }
  return {
    componentId: component.id,
    oldKey,
    oldVal,
    newKey,
    newVal,
  }
}
