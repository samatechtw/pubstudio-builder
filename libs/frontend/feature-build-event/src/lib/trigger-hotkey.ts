import {
  setBuildSubmenu,
  setEditBehavior,
  setStyleTab,
  showTranslations,
  toggleEditorMenu,
} from '@pubstudio/frontend/data-access-command'
import {
  addBuiltinComponent,
  newGlobalStyle,
  newMixin,
  newPage,
  setShowExportModal,
  setShowSelectTemplateModal,
} from '@pubstudio/frontend/feature-build'
import { DefaultHotkeys } from '@pubstudio/frontend/feature-builtin-editor'
import { showCreateAssetModal } from '@pubstudio/frontend/feature-site-assets'
import {
  buttonId,
  contactFormId,
  containerHorizontalId,
  containerVerticalId,
  dividerHorizontalId,
  dividerVerticalId,
  footerId,
  gridId,
  h1Id,
  h2Id,
  h3Id,
  h4Id,
  h5Id,
  h6Id,
  headerId,
  imageId,
  inputId,
  linkId,
  mailingListId,
  navMenuId,
  svgId,
  textareaId,
  textId,
  videoWrapId,
} from '@pubstudio/frontend/util-ids'
import {
  AssetHotkeys,
  BehaviorHotkeys,
  BuildSubmenu,
  ComponentAdvancedHotkeys,
  ComponentHotkeys,
  CustomComponentHotkeys,
  EditorMode,
  FileHotkeys,
  HistoryHotkeys,
  HotkeyStates,
  ISite,
  Keys,
  MenuHotkeys,
  PageHotkeys,
  StyleHotkeys,
  StyleTab,
  ThemeHotkeys,
} from '@pubstudio/shared/type-site'
import {
  addCustomComponentAtIndex,
  newVueComponent,
  setPageByIndex,
  toggleStyleEdit,
} from './hotkey-actions'

const editorState = (site: ISite): HotkeyStates => {
  const { editor } = site
  if (editor?.mode === EditorMode.Styles) {
    return HotkeyStates.Style
  } else if (editor?.mode === EditorMode.Theme) {
    return HotkeyStates.Theme
  } else if (editor?.buildSubmenu === BuildSubmenu.New) {
    return HotkeyStates.ComponentBasic
  } else if (editor?.buildSubmenu === BuildSubmenu.Custom) {
    return HotkeyStates.CustomComponents
  } else if (editor?.buildSubmenu === BuildSubmenu.Page) {
    return HotkeyStates.Pages
  } else if (editor?.buildSubmenu === BuildSubmenu.Asset) {
    return HotkeyStates.Assets
  } else if (editor?.buildSubmenu === BuildSubmenu.Behavior) {
    return HotkeyStates.Behavior
  } else if (editor?.buildSubmenu === BuildSubmenu.History) {
    return HotkeyStates.History
  } else if (editor?.buildSubmenu === BuildSubmenu.File) {
    return HotkeyStates.File
  }
  return HotkeyStates.None
}

export const triggerHotkey = (site: ISite, key: Keys) => {
  const { editor } = site
  const state = editorState(site)
  const action: string | undefined =
    DefaultHotkeys[state]?.[key] ?? editor?.hotkeys[state]?.[key]
  if (action) {
    switch (action) {
      // Menus
      case MenuHotkeys.OpenNewComponent:
        setBuildSubmenu(editor, BuildSubmenu.New)
        break
      case MenuHotkeys.OpenCustomComponent:
        setBuildSubmenu(editor, BuildSubmenu.Custom)
        break
      case MenuHotkeys.OpenPages:
        setBuildSubmenu(editor, BuildSubmenu.Page)
        break
      case MenuHotkeys.OpenTheme:
        toggleEditorMenu(editor, EditorMode.Theme, true)
        break
      case MenuHotkeys.OpenStyle:
        toggleEditorMenu(editor, EditorMode.Styles, true)
        break
      case MenuHotkeys.OpenAssets:
        setBuildSubmenu(editor, BuildSubmenu.Asset)
        break
      case MenuHotkeys.OpenTranslations:
        showTranslations(editor, true)
        break
      case MenuHotkeys.OpenBehavior:
        setBuildSubmenu(editor, BuildSubmenu.Behavior)
        break
      case MenuHotkeys.OpenHistory:
        setBuildSubmenu(editor, BuildSubmenu.History)
        break
      case MenuHotkeys.OpenFile:
        setBuildSubmenu(editor, BuildSubmenu.File)
        break
      // Close menus
      case ComponentHotkeys.Close:
      case ComponentAdvancedHotkeys.Close:
      case CustomComponentHotkeys.Close:
      case PageHotkeys.Close:
      case AssetHotkeys.Close:
      case BehaviorHotkeys.Close:
      case HistoryHotkeys.Close:
      case FileHotkeys.Close:
        setBuildSubmenu(editor, undefined)
        break
      case ThemeHotkeys.Close:
      case StyleHotkeys.Close:
        if (editor?.mode) {
          toggleEditorMenu(editor, EditorMode.SelectedComponent, true)
        }
        break
      // Basic Components
      case ComponentHotkeys.NewSwitch:
        break
      case ComponentHotkeys.NewContainerH:
        addBuiltinComponent(site, { id: containerHorizontalId })
        break
      case ComponentHotkeys.NewContainerV:
        addBuiltinComponent(site, { id: containerVerticalId })
        break
      case ComponentHotkeys.NewGrid:
        addBuiltinComponent(site, { id: gridId })
        break
      case ComponentHotkeys.NewSvg:
        addBuiltinComponent(site, { id: svgId })
        break
      case ComponentHotkeys.NewImage:
        addBuiltinComponent(site, { id: imageId })
        break
      case ComponentHotkeys.NewVideo:
        addBuiltinComponent(site, { id: videoWrapId })
        break
      case ComponentHotkeys.NewText:
        addBuiltinComponent(site, { id: textId })
        break
      case ComponentHotkeys.NewLink:
        addBuiltinComponent(site, { id: linkId })
        break
      case ComponentHotkeys.NewH1:
        addBuiltinComponent(site, { id: h1Id })
        break
      case ComponentHotkeys.NewH2:
        addBuiltinComponent(site, { id: h2Id })
        break
      case ComponentHotkeys.NewH3:
        addBuiltinComponent(site, { id: h3Id })
        break
      case ComponentHotkeys.NewH4:
        addBuiltinComponent(site, { id: h4Id })
        break
      case ComponentHotkeys.NewH5:
        addBuiltinComponent(site, { id: h5Id })
        break
      case ComponentHotkeys.NewH6:
        addBuiltinComponent(site, { id: h6Id })
        break
      case ComponentHotkeys.NewNumberList:
        addBuiltinComponent(site, { id: '' })
        break
      case ComponentHotkeys.NewBulletList:
        addBuiltinComponent(site, { id: '' })
        break
      case ComponentHotkeys.NewInput:
        addBuiltinComponent(site, { id: inputId })
        break
      case ComponentHotkeys.NewTextarea:
        addBuiltinComponent(site, { id: textareaId })
        break
      case ComponentHotkeys.NewDividerH:
        addBuiltinComponent(site, { id: dividerHorizontalId })
        break
      case ComponentHotkeys.NewDividerV:
        addBuiltinComponent(site, { id: dividerVerticalId })
        break
      case ComponentHotkeys.NewVue:
        newVueComponent()
        break
      // Advanced Components
      case ComponentAdvancedHotkeys.NewButton:
        addBuiltinComponent(site, { id: buttonId })
        break
      case ComponentAdvancedHotkeys.NewNavMenu:
        addBuiltinComponent(site, { id: navMenuId })
        break
      case ComponentAdvancedHotkeys.NewHeader:
        addBuiltinComponent(site, { id: headerId })
        break
      case ComponentAdvancedHotkeys.NewFooter:
        addBuiltinComponent(site, { id: footerId })
        break
      case ComponentAdvancedHotkeys.NewContactForm:
        addBuiltinComponent(site, { id: contactFormId })
        break
      case ComponentAdvancedHotkeys.NewMailingList:
        addBuiltinComponent(site, { id: mailingListId })
        break
      // Custom components
      case CustomComponentHotkeys.Custom1:
        addCustomComponentAtIndex(site, 0)
        break
      case CustomComponentHotkeys.Custom2:
        addCustomComponentAtIndex(site, 1)
        break
      case CustomComponentHotkeys.Custom3:
        addCustomComponentAtIndex(site, 2)
        break
      case CustomComponentHotkeys.Custom4:
        addCustomComponentAtIndex(site, 3)
        break
      case CustomComponentHotkeys.Custom5:
        addCustomComponentAtIndex(site, 4)
        break
      case CustomComponentHotkeys.Custom6:
        addCustomComponentAtIndex(site, 5)
        break
      case CustomComponentHotkeys.Custom7:
        addCustomComponentAtIndex(site, 6)
        break
      case CustomComponentHotkeys.Custom8:
        addCustomComponentAtIndex(site, 7)
        break
      case CustomComponentHotkeys.Custom9:
        addCustomComponentAtIndex(site, 8)
        break
      // Page menu
      case PageHotkeys.PageNew:
        newPage(editor)
        break
      case PageHotkeys.Page1:
        setPageByIndex(site, 0)
        break
      case PageHotkeys.Page2:
        setPageByIndex(site, 1)
        break
      case PageHotkeys.Page3:
        setPageByIndex(site, 2)
        break
      case PageHotkeys.Page4:
        setPageByIndex(site, 3)
        break
      case PageHotkeys.Page5:
        setPageByIndex(site, 4)
        break
      case PageHotkeys.Page6:
        setPageByIndex(site, 5)
        break
      case PageHotkeys.Page7:
        setPageByIndex(site, 6)
        break
      case PageHotkeys.Page8:
        setPageByIndex(site, 7)
        break
      case PageHotkeys.Page9:
        setPageByIndex(site, 8)
        break
      // Style menu
      case StyleHotkeys.StyleSwitch:
        toggleStyleEdit(site)
        break
      case StyleHotkeys.NewMixin:
        setStyleTab(site.editor, StyleTab.Reusable)
        newMixin(site, undefined)
        break
      case StyleHotkeys.NewGlobal:
        setStyleTab(site.editor, StyleTab.Global)
        newGlobalStyle(site)
        break
      // Asset menu
      case AssetHotkeys.NewAsset:
        showCreateAssetModal.value = true
        break
      // Behavior menu
      case BehaviorHotkeys.NewBehavior:
        setEditBehavior(editor, { name: '' })
        break
      // File menu
      case FileHotkeys.Import:
        break
      case FileHotkeys.Export:
        setShowExportModal(true)
        break
      case FileHotkeys.Templates:
        setShowSelectTemplateModal(true)
        break
    }
  }
}
