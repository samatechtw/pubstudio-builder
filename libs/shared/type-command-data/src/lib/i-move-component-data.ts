export interface IMoveComponentData {
  from: IComponentPosition
  to: IComponentPosition
  selectedComponentId?: string
}

export interface IComponentPosition {
  parentId: string
  index: number
}
