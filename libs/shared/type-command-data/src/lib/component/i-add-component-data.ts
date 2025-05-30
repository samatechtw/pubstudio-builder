import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IComponentEditorEvents,
  IComponentEvents,
  IComponentInputs,
  IComponentState,
  IComponentStyle,
  ISerializedComponent,
  TagType,
} from '@pubstudio/shared/type-site'

export interface IAddComponentData {
  // Populate the ID so if we're creating children, the undo command knows which component
  // to delete. (the latest ID would be the last added child)
  // `nextComponentId` must be called in the apply command, otherwise re-doing the command later will
  // not update context `nextId` correctly.
  id?: string
  // Human readable name
  name?: string
  // HTML tag
  tag: TagType
  // HTML content
  content?: string
  // DOM parent
  parentId: string
  // Index to insert new component in parent's children array
  parentIndex?: number
  // Source to copy props from
  sourceId?: string
  // Custom component id
  customComponentId?: string
  style?: IComponentStyle
  state?: Record<string, IComponentState>
  inputs?: IComponentInputs
  events?: IComponentEvents
  editorEvents?: IComponentEditorEvents
  // Used for builtin components with deep children
  children?: ISerializedComponent[]
  // Used to set selected component back after undo
  selectedComponentId?: string
  // Records whether the component and children are hidden in the editor at the time of undo
  hidden?: Record<string, boolean>
}

export interface AddComponent extends ICommand<IAddComponentData> {
  type: CommandType.AddComponent
}
