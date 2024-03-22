import { IDraggedComponentAddData } from './i-dragged-component-add-data'
import { XYCoord } from './row-layout'

export enum BuilderDndType {
  Component = 'c',
}

export interface IDraggedComponent {
  componentId: string
  parentId: string | undefined
  // left/top offset from element when clicked
  clickOffset: XYCoord
  index: number
  addData?: IDraggedComponentAddData
}

export interface IDragProps {
  dragging: boolean
  hovering: boolean
}

export interface IDropProps {
  hoverSelf: boolean
  hoverTop: boolean
  hoverRight: boolean
  hoverBottom: boolean
  hoverLeft: boolean
  destinationIndex: number
  parentIsRow: boolean
}

export type IDndState = IDragProps & IDropProps

export interface IDroppedFile {
  componentId: string
  index: number
  file: File
}
