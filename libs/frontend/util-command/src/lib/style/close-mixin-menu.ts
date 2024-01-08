import { resolveComponent, resolveStyle } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICloseMixinMenuData } from '@pubstudio/shared/type-command-data'
import { EditorMode, ISite } from '@pubstudio/shared/type-site'
import { closeMixinMenu, setEditingMixin } from '../edit-styles-data'
import { toggleEditorMenu } from '../editor-helpers'
import { setSelectedComponent } from '../set-selected-component'

export interface CloseMixinMenu extends ICommand<ICloseMixinMenuData> {
  type: CommandType.CloseMixinMenu
}

export const applyCloseMixinMenu = (site: ISite, data: ICloseMixinMenuData) => {
  const { id } = data
  const style = resolveStyle(site.context, id)
  if (style) {
    closeMixinMenu(site)
  }
}

export const undoCloseMixinMenu = (site: ISite, data: ICloseMixinMenuData) => {
  const { id, componentId } = data
  const style = resolveStyle(site.context, id)
  if (style) {
    if (componentId) {
      const component = resolveComponent(site.context, componentId)
      if (component) {
        setSelectedComponent(site, component)
      }
    } else {
      // No componentId means the mixin was opened from the style menu
      toggleEditorMenu(site.editor, EditorMode.Styles, true)
    }
    setEditingMixin(site, id, componentId)
  }
}
