import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IComponentEditorEvents,
  IComponentEvents,
  IComponentInputs,
  IComponentStyle,
  Tag,
} from '@pubstudio/shared/type-site'

export interface IAddReusableComponentData {
  // Populate the ID so if we're creating children, the undo command knows which component
  // to delete. (the latest ID would be the last added child)
  // `nextReusableComponentId` must be called in the apply command, otherwise re-doing the command later will
  // not update context `nextId` correctly.
  id?: string
  // Human readable name
  name?: string
  // HTML tag
  tag: Tag
  // HTML content
  content?: string
  // Parent reusable component id
  parentId?: string
  // Component to copy props from
  sourceId?: string
  style?: IComponentStyle
  inputs?: IComponentInputs
  events?: IComponentEvents
  editorEvents?: IComponentEditorEvents
  // Used to set selected component back after undo
  selectedComponentId?: string
}

export interface AddReusableComponent extends ICommand<IAddReusableComponentData> {
  type: CommandType.AddComponent
}
