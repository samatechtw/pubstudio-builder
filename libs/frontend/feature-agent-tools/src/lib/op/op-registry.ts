import { CommandType } from '@pubstudio/shared/type-command'
import { setBehaviorArgOp, setBehaviorOp } from '../ops/behavior'
import {
  addComponentOp,
  addCustomComponentOp,
  editComponentOp,
  mergeComponentStyleOp,
  moveComponentOp,
  removeComponentOp,
  replacePageRootOp,
} from '../ops/component'
import {
  setComponentEditorEventOp,
  setComponentEventOp,
  setComponentInputOp,
  setComponentStateOp,
} from '../ops/component-io'
import {
  addComponentMixinOp,
  removeComponentMixinOp,
  removeOverrideStyleOp,
  replaceComponentMixinOp,
  setComponentStyleOp,
  setOverrideStyleOp,
} from '../ops/component-style'
import {
  addMixinOp,
  removeMixinOp,
  renameMixinOp,
  setMixinStyleOp,
  updateMixinOrderOp,
} from '../ops/mixin'
import {
  addPageOp,
  changePageOp,
  editPageOp,
  removePageOp,
  setHomePageOp,
  setPageHeadOp,
} from '../ops/page'
import {
  replaceTranslationsOp,
  setBreakpointsOp,
  setGlobalStyleOp,
  setSiteHeadOp,
  setTranslationsOp,
} from '../ops/site'
import {
  addThemeFontOp,
  addThemeVariableOp,
  editThemeFontOp,
  editThemeVariableOp,
  removeThemeFontOp,
  removeThemeVariableOp,
} from '../ops/theme'
import { AnyOpDef, excluded, isOp, OpEntry } from './define-op'

// Keyed by CommandType so adding a command fails to compile until it is either
// wrapped in an op or explicitly excluded with a reason.
export const OP_REGISTRY: Record<CommandType, OpEntry> = {
  [CommandType.AddComponent]: addComponentOp,
  [CommandType.EditComponent]: editComponentOp,
  [CommandType.RemoveComponent]: removeComponentOp,
  [CommandType.MoveComponent]: moveComponentOp,
  [CommandType.ReplacePageRoot]: replacePageRootOp,
  [CommandType.MergeComponentStyle]: mergeComponentStyleOp,
  [CommandType.AddCustomComponent]: addCustomComponentOp,

  [CommandType.SetComponentCustomStyle]: setComponentStyleOp,
  [CommandType.SetComponentOverrideStyle]: setOverrideStyleOp,
  [CommandType.RemoveComponentOverrideStyle]: removeOverrideStyleOp,
  [CommandType.AddComponentMixin]: addComponentMixinOp,
  [CommandType.RemoveComponentMixin]: removeComponentMixinOp,
  [CommandType.ReplaceComponentMixin]: replaceComponentMixinOp,

  [CommandType.SetComponentInput]: setComponentInputOp,
  [CommandType.SetComponentEvent]: setComponentEventOp,
  [CommandType.SetComponentEditorEvent]: setComponentEditorEventOp,
  [CommandType.SetComponentState]: setComponentStateOp,

  [CommandType.SetBehavior]: setBehaviorOp,
  [CommandType.SetBehaviorArg]: setBehaviorArgOp,

  [CommandType.AddStyleMixin]: addMixinOp,
  [CommandType.EditStyleMixin]: renameMixinOp,
  [CommandType.RemoveStyleMixin]: removeMixinOp,
  [CommandType.SetMixinEntry]: setMixinStyleOp,
  [CommandType.UpdateMixinOrder]: updateMixinOrderOp,

  [CommandType.AddThemeVariable]: addThemeVariableOp,
  [CommandType.EditThemeVariable]: editThemeVariableOp,
  [CommandType.RemoveThemeVariable]: removeThemeVariableOp,
  [CommandType.AddThemeFont]: addThemeFontOp,
  [CommandType.EditThemeFont]: editThemeFontOp,
  [CommandType.RemoveThemeFont]: removeThemeFontOp,

  [CommandType.AddPage]: addPageOp,
  [CommandType.EditPage]: editPageOp,
  [CommandType.RemovePage]: removePageOp,
  [CommandType.ChangePage]: changePageOp,
  [CommandType.SetHomePage]: setHomePageOp,
  [CommandType.SetPageHead]: setPageHeadOp,

  [CommandType.SetDefaultsHead]: setSiteHeadOp,
  [CommandType.SetGlobalStyle]: setGlobalStyleOp,
  [CommandType.SetBreakpoint]: setBreakpointsOp,
  [CommandType.SetTranslations]: setTranslationsOp,
  [CommandType.ReplaceTranslations]: replaceTranslationsOp,

  [CommandType.Undo]: excluded('Exposed as history({action:"undo"}), not as an op.'),
  [CommandType.Redo]: excluded('Exposed as history({action:"redo"}), not as an op.'),
  [CommandType.Group]: excluded('Implicit: every apply() call is wrapped in one group.'),
  [CommandType.UpdateUi]: excluded('Builder UI state only; no effect on site output.'),
  [CommandType.MigrateSite]: excluded('System-driven site version migration.'),
}

export const agentOps = (): AnyOpDef[] => Object.values(OP_REGISTRY).filter(isOp)

const opsByName: Record<string, AnyOpDef> = Object.fromEntries(
  agentOps().map((op) => [op.name, op]),
)

export const findOp = (name: string): AnyOpDef | undefined => opsByName[name]

export const opNames = (): string[] => Object.keys(opsByName)
