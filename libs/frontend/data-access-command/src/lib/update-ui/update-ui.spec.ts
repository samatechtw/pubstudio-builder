import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { IUpdateUiParams, UiAction } from '@pubstudio/shared/type-command-data'
import {
  EditorMode,
  ISerializedEditorContext,
  ISerializedSite,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyOpenMixinMenu, undoOpenMixinMenu } from './open-mixin-menu'
import { applyCloseMixinMenu, undoCloseMixinMenu } from './close-mixin-menu'

describe('Update Ui', () => {
  let siteString: string
  let site: ISite

  const initMixinMenu = (
    selectedComponentId: string | undefined,
    editingMixinId: string | undefined,
    openFromComponentMenu: boolean,
  ) => {
    const serialized: ISerializedSite = {
      ...mockSerializedSite,
      editor: {
        ...(mockSerializedSite.editor as ISerializedEditorContext),
        selectedComponentId,
        mode: openFromComponentMenu ? EditorMode.SelectedComponent : EditorMode.Styles,
        editingMixinData: editingMixinId
          ? {
              mixinId: editingMixinId,
              originComponentId: openFromComponentMenu ? selectedComponentId : undefined,
            }
          : undefined,
      },
    }
    siteString = JSON.stringify(serialized)
    site = deserializeSite(siteString) as ISite
  }

  describe('open mixin menu', () => {
    it('should open mixin menu', () => {
      const mixinId = 'global-s-0'
      const selectedComponentId = 'test-c-0'
      initMixinMenu(selectedComponentId, undefined, true)

      // Assert the initial editor state
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)
      expect(site.editor?.editingMixinData).toBeUndefined()

      // Open mixin menu
      const params: IUpdateUiParams[UiAction.OpenMixinMenu] = {
        mixinId,
        originComponentId: selectedComponentId,
      }
      applyOpenMixinMenu(site, params)

      // Assert editor state after opening menu
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)
      expect(site.editor?.editingMixinData).toEqual({
        mixinId,
        originComponentId: selectedComponentId,
      })
    })

    it('should open mixin menu and undo', () => {
      const mixinId = 'global-s-0'
      const selectedComponentId = 'test-c-0'
      initMixinMenu(selectedComponentId, undefined, true)

      // Open mixin menu and undo
      const params: IUpdateUiParams[UiAction.OpenMixinMenu] = {
        mixinId,
        originComponentId: selectedComponentId,
      }
      applyOpenMixinMenu(site, params)
      undoOpenMixinMenu(site, params)

      // Assert editor state after undo
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.SelectedComponent)
      expect(site.editor?.editingMixinData).toBeUndefined()
    })
  })

  describe('close mixin menu', () => {
    it('should close mixin menu', () => {
      const mixinId = 'global-s-0'
      const selectedComponentId = 'test-c-1'
      initMixinMenu(selectedComponentId, mixinId, false)

      // Assert the initial editor state
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.Styles)
      expect(site.editor?.editingMixinData).toEqual({
        mixinId,
        originComponentId: undefined,
      })

      // Close mixin menu
      const params: IUpdateUiParams[UiAction.CloseMixinMenu] = {
        mixinId,
        originComponentId: undefined,
      }
      applyCloseMixinMenu(site, params)

      // Assert editor state after closing menu
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.Styles)
      expect(site.editor?.editingMixinData).toBeUndefined()
    })

    it('should close mixin menu and undo', () => {
      const mixinId = 'global-s-0'
      const selectedComponentId = 'test-c-1'
      initMixinMenu(selectedComponentId, mixinId, false)

      // Assert the initial editor state
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.Styles)
      expect(site.editor?.editingMixinData).toEqual({
        mixinId,
        originComponentId: undefined,
      })

      // Close mixin menu and undo
      const params: IUpdateUiParams[UiAction.CloseMixinMenu] = {
        mixinId,
        originComponentId: undefined,
      }
      applyCloseMixinMenu(site, params)
      undoCloseMixinMenu(site, params)

      // Assert editor state after undo
      expect(site.editor?.selectedComponent?.id).toEqual(selectedComponentId)
      expect(site.editor?.mode).toEqual(EditorMode.Styles)
      expect(site.editor?.editingMixinData).toEqual({
        mixinId,
        originComponentId: undefined,
      })
    })
  })
})
