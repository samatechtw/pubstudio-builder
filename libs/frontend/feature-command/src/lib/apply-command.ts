import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { applySetBehavior } from './behavior/set-behavior'
import { applySetBehaviorArg } from './behavior/set-behavior-arg'
import { applySetBreakpoint } from './breakpoint/set-breakpoint'
import { applySetComponentCustomStyle } from './component-custom-style/set-component-custom-style'
import { applySetComponentEvent } from './component-event/set-component-event'
import { applySetComponentInput } from './component-input/set-component-input'
import { applyAddComponentMixin } from './component-mixin/add-component-mixin'
import { applyRemoveComponentMixin } from './component-mixin/remove-component-mixin'
import { applyReplaceComponentMixin } from './component-mixin/replace-component-mixin'
import { applyMergeComponentStyle } from './component-style/merge-component-style'
import { applyAddComponent } from './component/add-component'
import { applyEditComponent } from './component/edit-component'
import { applyRemoveComponent } from './component/remove-component'
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
import { applyAddStyleMixin } from './style/add-style-mixin'
import { applyEditStyleMixin } from './style/edit-style-mixin'
import { applyRemoveStyleMixin } from './style/remove-style-mixin'
import { applyAddThemeFont } from './theme-font/add-theme-font'
import { applyEditThemeFont } from './theme-font/edit-theme-font'
import { applyRemoveThemeFont } from './theme-font/remove-theme-font'
import { applyAddThemeVariable } from './theme-variable/add-theme-variable'
import { applyEditThemeVariable } from './theme-variable/edit-theme-variable'
import { applyRemoveThemeVariable } from './theme-variable/remove-theme-variable'

// Applies a command to the current site context
export const applyCommand = (
  site: ISite,
  type: CommandType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): ICommand => {
  const command: ICommand = { type, data }
  const applyFunctions = {
    [CommandType.Redo]: noop,
    [CommandType.Undo]: noop,
    [CommandType.Group]: applyCommandGroup,
    [CommandType.AddComponent]: applyAddComponent,
    [CommandType.EditComponent]: applyEditComponent,
    [CommandType.RemoveComponent]: applyRemoveComponent,
    [CommandType.SetComponentCustomStyle]: applySetComponentCustomStyle,
    [CommandType.MergeComponentStyle]: applyMergeComponentStyle,
    [CommandType.AddComponentMixin]: applyAddComponentMixin,
    [CommandType.RemoveComponentMixin]: applyRemoveComponentMixin,
    [CommandType.ReplaceComponentMixin]: applyReplaceComponentMixin,
    [CommandType.SetComponentInput]: applySetComponentInput,
    [CommandType.SetComponentEvent]: applySetComponentEvent,
    [CommandType.SetBehavior]: applySetBehavior,
    [CommandType.SetBehaviorArg]: applySetBehaviorArg,
    [CommandType.AddStyleMixin]: applyAddStyleMixin,
    [CommandType.EditStyleMixin]: applyEditStyleMixin,
    [CommandType.RemoveStyleMixin]: applyRemoveStyleMixin,
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
  }
  applyFunctions[type](site, data)
  return command
}
