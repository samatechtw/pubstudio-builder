import {
  IComponentPosition,
  IMoveComponentData,
} from '@pubstudio/shared/type-command-data'

export const mockMoveComponentData = (
  from: IComponentPosition,
  to: IComponentPosition,
): IMoveComponentData => {
  const data: IMoveComponentData = {
    from,
    to,
  }
  return data
}
