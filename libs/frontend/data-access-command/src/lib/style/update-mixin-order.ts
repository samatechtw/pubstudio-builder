import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IUpdateMixinOrderData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface UpdateMixinOrder extends ICommand<IUpdateMixinOrderData> {
  type: CommandType.UpdateMixinOrder
}

export const applyUpdateMixinOrder = (site: ISite, data: IUpdateMixinOrderData) => {
  const { pos, newPos } = data
  const removed = site.context.styleOrder.splice(pos, 1)
  if (removed[0]) {
    site.context.styleOrder.splice(newPos, 0, removed[0])
  }
}

export const undoUpdateMixinOrder = (site: ISite, data: IUpdateMixinOrderData) => {
  const { pos, newPos } = data
  const removed = site.context.styleOrder.splice(newPos, 1)
  if (removed[0]) {
    site.context.styleOrder.splice(pos, 0, removed[0])
  }
}
