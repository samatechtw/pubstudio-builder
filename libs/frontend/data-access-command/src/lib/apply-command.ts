import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { applySetBehavior } from './behavior/set-behavior'
import { applySetBehaviorArg } from './behavior/set-behavior-arg'
import { applySetBreakpoint } from './breakpoint/set-breakpoint'
import { applySetComponentCustomStyle } from './component-custom-style/set-component-custom-style'
import { applySetComponentEditorEvent } from './component-event/set-component-editor-event'
import { applySetComponentEvent } from './component-event/set-component-event'
import { applySetComponentInput } from './component-input/set-component-input'
import { applyAddComponentMixin } from './component-mixin/add-component-mixin'
import { applyRemoveComponentMixin } from './component-mixin/remove-component-mixin'
import { applyReplaceComponentMixin } from './component-mixin/replace-component-mixin'
import { applyRemoveComponentOverrideStyle } from './component-override-style/remove-component-override-style'
import { applySetComponentOverrideStyle } from './component-override-style/set-component-override-style'
import { applyMergeComponentStyle } from './component-style/merge-component-style'
import { applyAddComponent } from './component/add-component'
import { applyEditComponent } from './component/edit-component'
import { applyRemoveComponent } from './component/remove-component'
import { applyReplacePageRoot } from './component/replace-page-root'
import { applySetDefaultsHead } from './defaults/set-defaults-head'
import { applyCommandGroup } from './group/command-group'
import { applyMoveComponent } from './move-component/move-component'
import { noop } from './noop'
import { applyAddPage } from './page/add-page'
import { applyChangePage } from './page/change-page'
import { applyEditPage } from './page/edit-page'
import { applyRemovePage } from './page/remove-page'
import { applySetHomePage } from './page/set-home-page'
import { applySetPageHead } from './page/set-page-head'
import { applyAddReusableComponent } from './reusable-component/add-reusable-component'
import { applyAddStyleMixin } from './style/add-style-mixin'
import { applyEditStyleMixin } from './style/edit-style-mixin'
import { applyRemoveStyleMixin } from './style/remove-style-mixin'
import { applySetGlobalStyle } from './style/set-global-style'
import { applySetMixinEntry } from './style/set-mixin-entry'
import { applyUpdateMixinOrder } from './style/update-mixin-order'
import { applyAddThemeFont } from './theme-font/add-theme-font'
import { applyEditThemeFont } from './theme-font/edit-theme-font'
import { applyRemoveThemeFont } from './theme-font/remove-theme-font'
import { applyAddThemeVariable } from './theme-variable/add-theme-variable'
import { applyEditThemeVariable } from './theme-variable/edit-theme-variable'
import { applyRemoveThemeVariable } from './theme-variable/remove-theme-variable'
import { applySetTranslations } from './translations/set-translations'
import { applyUpdateUi } from './update-ui/update-ui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApplyFn = (site: ISite, data: any, isRedo?: boolean) => void

// Applies a command to the current site context
export const applyCommand = (
  site: ISite,
  command: ICommand,
  isRedo = false,
): ICommand => {
  const applyFunctions: Record<CommandType, ApplyFn> = {
    [CommandType.Redo]: noop,
    [CommandType.Undo]: noop,
    [CommandType.Group]: applyCommandGroup,
    [CommandType.AddComponent]: applyAddComponent,
    [CommandType.EditComponent]: applyEditComponent,
    [CommandType.RemoveComponent]: applyRemoveComponent,
    [CommandType.ReplacePageRoot]: applyReplacePageRoot,
    [CommandType.SetComponentCustomStyle]: applySetComponentCustomStyle,
    [CommandType.SetComponentOverrideStyle]: applySetComponentOverrideStyle,
    [CommandType.RemoveComponentOverrideStyle]: applyRemoveComponentOverrideStyle,
    [CommandType.MergeComponentStyle]: applyMergeComponentStyle,
    [CommandType.AddComponentMixin]: applyAddComponentMixin,
    [CommandType.RemoveComponentMixin]: applyRemoveComponentMixin,
    [CommandType.ReplaceComponentMixin]: applyReplaceComponentMixin,
    [CommandType.SetComponentInput]: applySetComponentInput,
    [CommandType.SetComponentEvent]: applySetComponentEvent,
    [CommandType.SetComponentEditorEvent]: applySetComponentEditorEvent,
    [CommandType.SetBehavior]: applySetBehavior,
    [CommandType.SetBehaviorArg]: applySetBehaviorArg,
    [CommandType.SetTranslations]: applySetTranslations,
    [CommandType.AddStyleMixin]: applyAddStyleMixin,
    [CommandType.EditStyleMixin]: applyEditStyleMixin,
    [CommandType.RemoveStyleMixin]: applyRemoveStyleMixin,
    [CommandType.UpdateMixinOrder]: applyUpdateMixinOrder,
    [CommandType.SetMixinEntry]: applySetMixinEntry,
    [CommandType.AddThemeVariable]: applyAddThemeVariable,
    [CommandType.EditThemeVariable]: applyEditThemeVariable,
    [CommandType.RemoveThemeVariable]: applyRemoveThemeVariable,
    [CommandType.AddThemeFont]: applyAddThemeFont,
    [CommandType.EditThemeFont]: applyEditThemeFont,
    [CommandType.RemoveThemeFont]: applyRemoveThemeFont,
    [CommandType.AddPage]: applyAddPage,
    [CommandType.EditPage]: applyEditPage,
    [CommandType.RemovePage]: applyRemovePage,
    [CommandType.ChangePage]: applyChangePage,
    [CommandType.SetHomePage]: applySetHomePage,
    [CommandType.SetPageHead]: applySetPageHead,
    [CommandType.MoveComponent]: applyMoveComponent,
    [CommandType.SetDefaultsHead]: applySetDefaultsHead,
    [CommandType.SetBreakpoint]: applySetBreakpoint,
    [CommandType.SetGlobalStyle]: applySetGlobalStyle,
    [CommandType.UpdateUi]: applyUpdateUi,
    [CommandType.AddReusableComponent]: applyAddReusableComponent,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFunctions[command.type](site, command.data as any, isRedo)
  return command
}
