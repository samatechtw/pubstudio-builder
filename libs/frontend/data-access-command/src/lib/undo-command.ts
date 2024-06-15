import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { undoSetBehavior } from './behavior/set-behavior'
import { undoSetBehaviorArg } from './behavior/set-behavior-arg'
import { undoSetBreakpoint } from './breakpoint/set-breakpoint'
import { undoSetComponentCustomStyle } from './component-custom-style/set-component-custom-style'
import { undoSetComponentEditorEvent } from './component-event/set-component-editor-event'
import { undoSetComponentEvent } from './component-event/set-component-event'
import { undoSetComponentInput } from './component-input/set-component-input'
import { undoAddComponentMixin } from './component-mixin/add-component-mixin'
import { undoRemoveComponentMixin } from './component-mixin/remove-component-mixin'
import { undoReplaceComponentMixin } from './component-mixin/replace-component-mixin'
import { undoRemoveComponentOverrideStyle } from './component-override-style/remove-component-override-style'
import { undoSetComponentOverrideStyle } from './component-override-style/set-component-override-style'
import { undoMergeComponentStyle } from './component-style/merge-component-style'
import { undoAddComponent } from './component/add-component'
import { undoEditComponent } from './component/edit-component'
import { undoRemoveComponent } from './component/remove-component'
import { undoReplacePageRoot } from './component/replace-page-root'
import { undoAddCustomComponent } from './custom-component/add-custom-component'
import { undoSetDefaultsHead } from './defaults/set-defaults-head'
import { undoCommandGroup } from './group/command-group'
import { undoMoveComponent } from './move-component/move-component'
import { noop } from './noop'
import { undoAddPage } from './page/add-page'
import { undoChangePage } from './page/change-page'
import { undoEditPage } from './page/edit-page'
import { undoRemovePage } from './page/remove-page'
import { undoSetHomePage } from './page/set-home-page'
import { undoSetPageHead } from './page/set-page-head'
import { undoAddStyleMixin } from './style/add-style-mixin'
import { undoEditStyleMixin } from './style/edit-style-mixin'
import { undoRemoveStyleMixin } from './style/remove-style-mixin'
import { undoSetGlobalStyle } from './style/set-global-style'
import { undoSetMixinEntry } from './style/set-mixin-entry'
import { undoUpdateMixinOrder } from './style/update-mixin-order'
import { undoAddThemeFont } from './theme-font/add-theme-font'
import { undoEditThemeFont } from './theme-font/edit-theme-font'
import { undoRemoveThemeFont } from './theme-font/remove-theme-font'
import { undoAddThemeVariable } from './theme-variable/add-theme-variable'
import { undoEditThemeVariable } from './theme-variable/edit-theme-variable'
import { undoRemoveThemeVariable } from './theme-variable/remove-theme-variable'
import { undoSetTranslations } from './translations/set-translations'
import { undoUpdateUi } from './update-ui/update-ui'

// Undo the most recent command and shift it to the redo stack
export const undoCommand = (site: ISite, command: ICommand) => {
  const applyFunction = {
    [CommandType.Redo]: noop,
    [CommandType.Undo]: noop,
    [CommandType.Group]: undoCommandGroup,
    [CommandType.AddComponent]: undoAddComponent,
    [CommandType.EditComponent]: undoEditComponent,
    [CommandType.RemoveComponent]: undoRemoveComponent,
    [CommandType.ReplacePageRoot]: undoReplacePageRoot,
    [CommandType.SetComponentCustomStyle]: undoSetComponentCustomStyle,
    [CommandType.SetComponentOverrideStyle]: undoSetComponentOverrideStyle,
    [CommandType.RemoveComponentOverrideStyle]: undoRemoveComponentOverrideStyle,
    [CommandType.MergeComponentStyle]: undoMergeComponentStyle,
    [CommandType.AddComponentMixin]: undoAddComponentMixin,
    [CommandType.RemoveComponentMixin]: undoRemoveComponentMixin,
    [CommandType.ReplaceComponentMixin]: undoReplaceComponentMixin,
    [CommandType.SetComponentInput]: undoSetComponentInput,
    [CommandType.SetComponentEvent]: undoSetComponentEvent,
    [CommandType.SetComponentEditorEvent]: undoSetComponentEditorEvent,
    [CommandType.SetBehavior]: undoSetBehavior,
    [CommandType.SetBehaviorArg]: undoSetBehaviorArg,
    [CommandType.AddStyleMixin]: undoAddStyleMixin,
    [CommandType.EditStyleMixin]: undoEditStyleMixin,
    [CommandType.RemoveStyleMixin]: undoRemoveStyleMixin,
    [CommandType.UpdateMixinOrder]: undoUpdateMixinOrder,
    [CommandType.SetMixinEntry]: undoSetMixinEntry,
    [CommandType.SetTranslations]: undoSetTranslations,
    [CommandType.AddThemeVariable]: undoAddThemeVariable,
    [CommandType.EditThemeVariable]: undoEditThemeVariable,
    [CommandType.RemoveThemeVariable]: undoRemoveThemeVariable,
    [CommandType.AddThemeFont]: undoAddThemeFont,
    [CommandType.EditThemeFont]: undoEditThemeFont,
    [CommandType.RemoveThemeFont]: undoRemoveThemeFont,
    [CommandType.AddPage]: undoAddPage,
    [CommandType.EditPage]: undoEditPage,
    [CommandType.RemovePage]: undoRemovePage,
    [CommandType.ChangePage]: undoChangePage,
    [CommandType.SetPageHead]: undoSetPageHead,
    [CommandType.SetHomePage]: undoSetHomePage,
    [CommandType.MoveComponent]: undoMoveComponent,
    [CommandType.SetDefaultsHead]: undoSetDefaultsHead,
    [CommandType.SetBreakpoint]: undoSetBreakpoint,
    [CommandType.SetGlobalStyle]: undoSetGlobalStyle,
    [CommandType.UpdateUi]: undoUpdateUi,
    [CommandType.AddCustomComponent]: undoAddCustomComponent,
  }[command.type]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFunction(site, command.data as any)
}
