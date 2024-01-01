import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ICloseMixinMenuData } from '@pubstudio/shared/type-command-data'
import {
  EditorMode,
  ISerializedEditorContext,
  ISerializedSite,
  ISite,
} from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'
import { applyCloseMixinMenu, undoCloseMixinMenu } from './close-mixin-menu'

describe('Close Mixin Menu', () => {
  let siteString: string
  let site: ISite

  // Initialize site with mixin menu opened
  const initMixinMenu = (selectedComponentId: string | undefined) => {
    const serialized: ISerializedSite = {
      ...mockSerializedSite,
      editor: {
        ...(mockSerializedSite.editor as ISerializedEditorContext),
        selectedComponentId,
        mode: selectedComponentId ? EditorMode.SelectedComponent : EditorMode.Styles,
      },
    }
    siteString = JSON.stringify(serialized)
    site = deserializeSite(siteString) as ISite
  }

  it('should close mixin menu from component source and undo', () => {
    const mixinId = 'global-s-0'
    const componentId = 'test-c-1'
    initMixinMenu(componentId)
    // Assert the initial editor state
    expect(site.editor?.selectedComponent?.id).toEqual(componentId)
    expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)

    // Close mixin menu
    const data: ICloseMixinMenuData = { id: mixinId, componentId }
    applyCloseMixinMenu(site, data)

    // Assert editor state after closing menu
    expect(site.editor?.selectedComponent?.id).toEqual(componentId)
    expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)

    // Undo close menu and return to component menu
    undoCloseMixinMenu(site, data)
    expect(site.editor?.selectedComponent?.id).toEqual(componentId)
    expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)
  })

  it('should close mixin menu from style menu', () => {
    const mixinId = 'global-s-0'
    const componentId = undefined
    initMixinMenu(componentId)
    // Assert the initial editor state
    expect(site.editor?.mode).toEqual(EditorMode.Styles)

    // Close mixin menu
    const data: ICloseMixinMenuData = { id: mixinId, componentId }
    applyCloseMixinMenu(site, data)
    // Assert editor state after closing menu
    expect(site.editor?.mode).toEqual(EditorMode.Styles)

    // Set selected component, which sets the editor mode
    setSelectedComponent(site, resolveComponent(site.context, 'test-c-1'))
    expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)

    // Assert editor state after undoing close menu
    undoCloseMixinMenu(site, data)
    expect(site.editor?.mode).toEqual(EditorMode.Styles)
  })
})
