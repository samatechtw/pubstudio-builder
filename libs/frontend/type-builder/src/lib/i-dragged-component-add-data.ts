export enum BuilderDragDataType {
  BuiltinComponent = 'builtin',
  CustomComponent = 'custom',
  ImageAsset = 'imageAsset',
  LinkAsset = 'linkAsset',
}

export interface IDraggedComponentAddData {
  id: string
  type: BuilderDragDataType
  content?: string
}
