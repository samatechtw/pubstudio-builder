import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { Tag } from '@pubstudio/shared/type-site'

export interface IReplacePageRootData {
  // Populate the ID so if we're creating children, the undo command knows which component
  // to delete. (the latest ID would be the last added child)
  // `nextComponentId` must be called in the apply command, otherwise re-doing the command later will
  // not update context `nextId` correctly.
  id?: string
  // Human readable name
  name?: string
  // HTML tag
  tag: Tag
  // HTML content
  content?: string
  // Source to copy props from
  sourceId: string
  // Page route to replace root
  route: string
}

export interface ReplacePageRoot extends ICommand<IReplacePageRootData> {
  type: CommandType.ReplacePageRoot
}
