// Compile-time coverage check: every field of every command data type must be either
// supplied by the agent (`input`), computed by the resolver (`derived`), or refused
// (`omitted`, with a written reason). Adding a field to an I*Data type breaks the build
// here until someone decides which of the three it is.
//
// The registry in op-registry.ts covers the other half — a new CommandType with no entry.
//
// Nothing imports this file: it exists purely to be typechecked. `nx test
// feature-agent-tools` runs tsc over tsconfig.typecheck.json before vitest, because
// neither vite nor eslint typechecks and CI has no tsc step of its own.

import {
  IAddComponentData,
  IAddCustomComponentData,
  IAddStyleMixinData,
  IAddThemeFontData,
  IAddThemeVariableData,
  IChangePageData,
  IEditComponentData,
  IEditPageData,
  IEditStyleMixinData,
  IEditThemeFontData,
  IEditThemeVariableData,
  IMergeComponentStyleData,
  IMoveComponentData,
  IAddPageData,
  IRemoveComponentData,
  IRemoveComponentOverrideStyleData,
  IRemovePageData,
  IRemoveStyleMixinData,
  IRemoveThemeFontData,
  IRemoveThemeVariableData,
  IReplaceComponentMixinData,
  IReplacePageRootData,
  IReplaceTranslationsData,
  ISetBehaviorArgData,
  ISetBehaviorData,
  ISetBreakpointData,
  ISetComponentCustomStyleData,
  ISetComponentEditorEventData,
  ISetComponentEventData,
  ISetComponentInputData,
  ISetComponentOverrideStyleData,
  ISetComponentStateData,
  ISetDefaultsHeadData,
  ISetGlobalStyleData,
  ISetHomePageData,
  ISetMixinEntryData,
  ISetPageHeadData,
  ISetTranslationsData,
  IComponentMixinData,
  IUpdateMixinOrderData,
} from '@pubstudio/shared/type-command-data'
import { Infer } from '../schema/schema'
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
import { AnyOpDef } from './define-op'

type Unaccounted<TData, TOp extends AnyOpDef> = Exclude<
  keyof TData,
  keyof Infer<TOp['input']> | TOp['derived'][number] | keyof TOp['omitted']
>

type Accounted<TData, TOp extends AnyOpDef> = [Unaccounted<TData, TOp>] extends [never]
  ? true
  : {
      ERROR: 'command data field not accounted for by op'
      fields: Unaccounted<TData, TOp>
    }

/* eslint-disable @typescript-eslint/no-unused-vars */
const _addComponent: Accounted<IAddComponentData, typeof addComponentOp> = true
const _editComponent: Accounted<IEditComponentData, typeof editComponentOp> = true
const _removeComponent: Accounted<IRemoveComponentData, typeof removeComponentOp> = true
const _moveComponent: Accounted<IMoveComponentData, typeof moveComponentOp> = true
const _replacePageRoot: Accounted<IReplacePageRootData, typeof replacePageRootOp> = true
const _mergeStyle: Accounted<IMergeComponentStyleData, typeof mergeComponentStyleOp> =
  true
const _addCustom: Accounted<IAddCustomComponentData, typeof addCustomComponentOp> = true

const _setStyle: Accounted<ISetComponentCustomStyleData, typeof setComponentStyleOp> =
  true
const _setOverride: Accounted<ISetComponentOverrideStyleData, typeof setOverrideStyleOp> =
  true
const _rmOverride: Accounted<
  IRemoveComponentOverrideStyleData,
  typeof removeOverrideStyleOp
> = true
const _addCmpMixin: Accounted<IComponentMixinData, typeof addComponentMixinOp> = true
const _rmCmpMixin: Accounted<IComponentMixinData, typeof removeComponentMixinOp> = true
const _repCmpMixin: Accounted<
  IReplaceComponentMixinData,
  typeof replaceComponentMixinOp
> = true

const _setInput: Accounted<ISetComponentInputData, typeof setComponentInputOp> = true
const _setEvent: Accounted<ISetComponentEventData, typeof setComponentEventOp> = true
const _setEditorEvent: Accounted<
  ISetComponentEditorEventData,
  typeof setComponentEditorEventOp
> = true
const _setState: Accounted<ISetComponentStateData, typeof setComponentStateOp> = true

const _setBehavior: Accounted<ISetBehaviorData, typeof setBehaviorOp> = true
const _setBehaviorArg: Accounted<ISetBehaviorArgData, typeof setBehaviorArgOp> = true

const _addMixin: Accounted<IAddStyleMixinData, typeof addMixinOp> = true
const _renameMixin: Accounted<IEditStyleMixinData, typeof renameMixinOp> = true
const _removeMixin: Accounted<IRemoveStyleMixinData, typeof removeMixinOp> = true
const _setMixinStyle: Accounted<ISetMixinEntryData, typeof setMixinStyleOp> = true
const _mixinOrder: Accounted<IUpdateMixinOrderData, typeof updateMixinOrderOp> = true

const _addVar: Accounted<IAddThemeVariableData, typeof addThemeVariableOp> = true
const _editVar: Accounted<IEditThemeVariableData, typeof editThemeVariableOp> = true
const _rmVar: Accounted<IRemoveThemeVariableData, typeof removeThemeVariableOp> = true
const _addFont: Accounted<IAddThemeFontData, typeof addThemeFontOp> = true
const _editFont: Accounted<IEditThemeFontData, typeof editThemeFontOp> = true
const _rmFont: Accounted<IRemoveThemeFontData, typeof removeThemeFontOp> = true

const _addPage: Accounted<IAddPageData, typeof addPageOp> = true
const _editPage: Accounted<IEditPageData, typeof editPageOp> = true
const _removePage: Accounted<IRemovePageData, typeof removePageOp> = true
const _changePage: Accounted<IChangePageData, typeof changePageOp> = true
const _setHomePage: Accounted<ISetHomePageData, typeof setHomePageOp> = true
const _setPageHead: Accounted<ISetPageHeadData, typeof setPageHeadOp> = true

const _setSiteHead: Accounted<ISetDefaultsHeadData, typeof setSiteHeadOp> = true
const _setGlobalStyle: Accounted<ISetGlobalStyleData, typeof setGlobalStyleOp> = true
const _setBreakpoints: Accounted<ISetBreakpointData, typeof setBreakpointsOp> = true
const _setTranslations: Accounted<ISetTranslationsData, typeof setTranslationsOp> = true
const _replaceTranslations: Accounted<
  IReplaceTranslationsData,
  typeof replaceTranslationsOp
> = true
/* eslint-enable @typescript-eslint/no-unused-vars */
