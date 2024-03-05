export enum DraggedComponentAddDataType {
  BuiltinComponent = 'builtin',
  ReusableComponent = 'reusable',
}

export interface IDraggedComponentAddData {
  id: string
  type: DraggedComponentAddDataType
}
