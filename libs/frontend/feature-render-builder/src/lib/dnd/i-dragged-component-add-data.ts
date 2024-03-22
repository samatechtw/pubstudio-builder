import { IAddComponentData } from '@pubstudio/shared/type-command-data'

export enum DraggedComponentAddDataType {
  BuiltinComponent = 'builtin',
  ReusableComponent = 'reusable',
}

export interface IDraggedComponentAddData extends IAddComponentData {
  type: DraggedComponentAddDataType
}
