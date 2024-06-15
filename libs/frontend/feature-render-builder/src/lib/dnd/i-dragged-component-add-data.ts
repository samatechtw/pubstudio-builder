export enum DraggedComponentAddDataType {
  BuiltinComponent = 'builtin',
  CustomComponent = 'custom',
}

export interface IDraggedComponentAddData {
  id: string
  type: DraggedComponentAddDataType
}
