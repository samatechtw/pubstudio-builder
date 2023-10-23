export interface IMoveComponentData {
  from: IComponentPosition
  to: IComponentPosition
}

export interface IComponentPosition {
  parentId: string
  index: number
}
