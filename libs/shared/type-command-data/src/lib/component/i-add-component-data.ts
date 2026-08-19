import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  AriaRoleType,
  IComponentEditorEvents,
  IComponentEvents,
  IComponentInputs,
  IComponentState,
  IComponentStyle,
  TagType,
} from '@pubstudio/shared/type-site'

// Fields shared by the top-level create and every explicit child create
export interface IAddComponentBaseData {
  // Human readable name
  name?: string
  // HTML tag
  tag: TagType
  role?: AriaRoleType
  // HTML content
  content?: string
  // Source to copy props from
  sourceId?: string
  // Custom component id
  customComponentId?: string
  style?: IComponentStyle
  state?: Record<string, IComponentState>
  inputs?: IComponentInputs
  events?: IComponentEvents
  editorEvents?: IComponentEditorEvents
  // Children to create, applied depth-first in array order. Takes precedence over
  // children copied from `sourceId`/`customComponentId`.
  children?: IAddComponentChildData[]
}

// A child create is self contained. Placement comes from the recursion, ids are
// allocated during apply, and select/undo belongs to the root only.
export type IAddComponentChildData = IAddComponentBaseData

export interface IAddComponentData extends IAddComponentBaseData {
  // Populate the ID so if we're creating children, the undo command knows which component
  // to delete. (the latest ID is the last added child)
  // `nextComponentId` must be called in the apply command, otherwise re-doing the command later
  // doesn't update context `nextId` correctly.
  id?: string
  // DOM parent
  parentId: string
  // Index to insert new component in parent's children array
  parentIndex?: number
  // Used to set selected component back after undo
  selectedComponentId?: string
  // Records whether the component and children are hidden in the editor at the time of undo
  hidden?: Record<string, boolean>
}

export interface AddComponent extends ICommand<IAddComponentData> {
  type: CommandType.AddComponent
}
