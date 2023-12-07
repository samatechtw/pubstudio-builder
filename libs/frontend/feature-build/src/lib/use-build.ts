import { useCommand } from '@pubstudio/frontend/feature-command'
import { setSelectedComponent } from '@pubstudio/frontend/feature-editor'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  createSite,
  resolvedComponentStyle,
  selectAddParent,
} from '@pubstudio/frontend/util-build'
import {
  builtinStyles,
  resolveComponent,
  resolveStyle,
} from '@pubstudio/frontend/util-builtin'
import {
  makeAddBuiltinComponentData,
  makeEditComponentData,
  makeRemoveComponentData,
  makeSetInputData,
  makeSetTranslationsData,
} from '@pubstudio/frontend/util-command'
import {
  computeComponentBreakpointStyles,
  computeComponentFlattenedStyles,
  flattenedComponentStyle,
} from '@pubstudio/frontend/util-component'
import { DEFAULT_BREAKPOINT_ID, styleId } from '@pubstudio/frontend/util-ids'
import { serializePage } from '@pubstudio/frontend/util-site-store'
import { uiAlert } from '@pubstudio/frontend/util-ui-alert'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentData,
  IAddComponentMixinData,
  IAddPageData,
  IAddStyleMixinData,
  IAddThemeFontData,
  IAddThemeVariableData,
  IChangePageData,
  ICommandGroupData,
  IComponentPosition,
  IEditComponentData,
  IEditComponentFields,
  IEditPageData,
  IEditStyleMixinData,
  IEditThemeFontData,
  IEditThemeVariableData,
  IMergeComponentStyleData,
  IMoveComponentData,
  INewTranslations,
  IRemoveComponentMixinData,
  IRemoveComponentOverrideStyleData,
  IRemovePageData,
  IRemoveStyleMixinData,
  IRemoveThemeFontData,
  IRemoveThemeVariableData,
  IReplaceComponentMixinData,
  IReplacePageRootData,
  ISetBehaviorArgData,
  ISetBehaviorData,
  ISetBreakpointData,
  ISetComponentCustomStyleData,
  ISetComponentEventData,
  ISetComponentInputData,
  ISetComponentOverrideStyleData,
  ISetDefaultsHeadData,
  ISetHomePageData,
  ISetPageHeadData,
} from '@pubstudio/shared/type-command-data'
import {
  Css,
  CssPseudoClass,
  IBehavior,
  IBehaviorArg,
  IBreakpoint,
  IComponent,
  IComponentEvent,
  IComponentInput,
  IEditorContext,
  IHeadObject,
  IHeadTag,
  IPage,
  IPageHeadTag,
  IPageMetadata,
  IRawStylesWithSource,
  ISerializedComponent,
  ISite,
  IStyle,
  IStyleEntry,
  IThemeFont,
  Tag,
  ThemeFontSource,
  WebSafeFont,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref, ref, toRaw } from 'vue'
import { resetStyleMenu } from './use-reusable-style-menu'
import { resetThemeMenuVariables } from './use-theme-menu-variables'

type IRemoveStyleEntry = Omit<IStyleEntry, 'value'>

export type IOldNewStyleEntry = {
  oldStyle?: IStyleEntry
  newStyle?: IStyleEntry
}

export type ISetTranslationsProps = {
  code: string
  translations: INewTranslations
  replace?: boolean
  forceSave?: boolean
}

// The element id of build content window
export const buildContentWindowId = 'build-content-window'

export interface IUseBuild {
  activePage: Ref<IPage | undefined>
  site: Ref<ISite>
  siteError: Ref<string | undefined>
  editor: ComputedRef<IEditorContext | undefined>
  currentPseudoClass: ComputedRef<CssPseudoClass>
  selectedComponentFlattenedStyles: ComputedRef<IRawStylesWithSource>
  commandAlert: Ref<CommandType | undefined>
  clearSiteError: () => void
  resetSite: () => void
  replaceSite: (newSite: ISite) => void
  addComponent: (data?: Partial<IAddComponentData>) => void
  addComponentData: (data: IAddComponentData) => void
  duplicateComponent: () => void
  pasteComponent: (copiedComponentId: string, parent: IComponent) => void
  replacePageRoot: (copiedComponentId: string, pageRoute: string) => void
  addBuiltinComponent: (id: string, parentId?: string) => void
  editSelectedComponent: (fields: IEditComponentFields) => void
  editComponent: (component: IComponent, fields: IEditComponentFields) => void
  setCustomStyle: (
    component: IComponent,
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
    replace?: boolean,
  ) => void
  setCustomStyles: (
    component: IComponent,
    styles: IOldNewStyleEntry[],
    replace?: boolean,
  ) => void
  setComponentCustomStyle: (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
    replace?: boolean,
  ) => void
  setPositionAbsolute: (oldStyle: IStyleEntry | undefined, newStyle: IStyleEntry) => void
  removeComponentCustomStyle: (style: IRemoveStyleEntry) => void
  setOverrideStyle: (
    selector: string,
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
  ) => void
  removeComponentOverrideStyleEntry: (selector: string, style: IRemoveStyleEntry) => void
  removeComponentOverrideStyle: (selector: string) => void
  mergeComponentStyle: (from: ISerializedComponent) => void
  addComponentMixin: (mixinId: string) => void
  removeComponentMixin: (mixinId: string) => void
  replaceComponentMixin: (oldMixinId: string, newMixinId: string) => void
  removeComponentEvent: (name: string) => void
  addComponentEvent: (newEvent: IComponentEvent) => void
  updateComponentEvent: (oldEventName: string, newEvent: IComponentEvent) => void
  addOrUpdateComponentInput: (property: string, payload: Partial<IComponentInput>) => void
  removeComponentInput: (name: string) => void
  setSelectedIsInput: (prop: string, newValue: unknown) => void
  setBehavior: (behavior: IBehavior) => void
  removeBehavior: (id: string) => void
  setBehaviorArg: (
    id: string,
    oldArg: IBehaviorArg | undefined,
    newArg: IBehaviorArg | undefined,
  ) => void
  addStyle: (style: IStyle) => void
  flattenComponentMixin: (componentId: string, mixinId: string) => void
  convertComponentStyle: (componentId: string, style: IStyle) => void
  editStyle: (style: IStyle) => void
  deleteStyle: (style: IStyle) => void
  setTranslations: (props: ISetTranslationsProps) => void
  setActiveI18n: (activeI18n: string) => void
  addThemeVariable: (data: IAddThemeVariableData) => void
  editThemeVariable: (data: IEditThemeVariableData) => void
  deleteThemeVariable: (themeVariable: IRemoveThemeVariableData) => void
  addThemeFont: (source: ThemeFontSource, name: string, fallback?: WebSafeFont) => void
  editThemeFont: (oldFont: IThemeFont, newFold: IThemeFont) => void
  deleteThemeFont: (font: IThemeFont) => void
  addPage: (page: IPageMetadata, copyFrom?: string) => void
  editPage: (oldPage: IPageMetadata, newPage: IPageMetadata) => void
  removePage: (route: string) => void
  changePage: (route: string) => void
  setHomePage: (route: string) => void
  deleteSelected: () => void
  selectComponentParent: () => void
  moveComponent: (from: IComponentPosition, to: IComponentPosition) => void
  moveAbsoluteComponent: (component: IComponent, left: string, top: string) => void
  addDefaultsHead: (tag: IHeadTag, value: IHeadObject) => void
  setDefaultsHead: (tag: IHeadTag, index: number, value: IHeadObject) => void
  removeDefaultsHead: (tag: IHeadTag, index: number) => void
  setFavicon: (newFavicon: string | undefined) => void
  addPageHead: (route: string, tag: IPageHeadTag, value: IHeadObject | string) => void
  setPageHead: (
    route: string,
    tag: IPageHeadTag,
    index: number,
    value: IHeadObject | string,
  ) => void
  removePageHead: (route: string, tag: IPageHeadTag, index: number) => void
  setPageFavicon: (route: string, newFavicon: string | undefined) => void
  setBreakpoint: (newBreakpoints: Record<string, IBreakpoint>) => void
  pushGroupCommands: (data: ICommandGroupData) => void
}

// Briefly indicates active command
const commandAlert = uiAlert<CommandType | undefined>(ref())

export const useBuild = (): IUseBuild => {
  const { site, siteError, siteStore } = useSiteSource()
  const { pushCommand, replaceLastCommand, getLastCommand } = useCommand()

  const activePage = computed(() => {
    const route = site.value.editor?.active
    if (!route) {
      return undefined
    }
    const pages = Object.values(site.value.pages)
    return pages.find((page) => page.route === route)
  })

  const editor = computed(() => {
    return site.value.editor
  })

  const currentPseudoClass = computed(
    () => editor.value?.cssPseudoClass ?? CssPseudoClass.Default,
  )

  const selectedComponentFlattenedStyles = computed<IRawStylesWithSource>(() => {
    const { selectedComponent } = site.value.editor ?? {}
    if (selectedComponent) {
      const breakpointStyles = computeComponentBreakpointStyles(
        site.value.context,
        selectedComponent,
      )
      const flattenedStyles = computeComponentFlattenedStyles(
        editor.value,
        breakpointStyles,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
      )
      return flattenedStyles
    } else {
      return {}
    }
  })

  const clearSiteError = () => {
    siteError.value = undefined
    resetSite()
  }

  const resetSite = () => {
    replaceSite(createSite(site.value.name ?? 'test'))
    resetStyleMenu()
    resetThemeMenuVariables()
  }

  const replaceSite = (newSite: ISite) => {
    site.value = newSite
    siteStore.value.save(site.value)
  }

  const addComponent = (data?: Partial<IAddComponentData>) => {
    let parent: IComponent | undefined
    if (data?.parentId) {
      parent = resolveComponent(site.value.context, data.parentId)
    }
    parent = parent ?? site.value.editor?.selectedComponent
    if (!activePage.value) {
      return
    }
    const addData: IAddComponentData = {
      name: data?.name,
      tag: data?.tag ?? Tag.Div,
      content: data?.content ?? 'test',
      ...selectAddParent(parent, activePage.value?.root.id),
      sourceId: data?.sourceId,
      style: {
        mixins: data?.style?.mixins,
        custom: data?.style?.custom ?? {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {
              width: '100px',
              height: '100px',
            },
          },
        },
      },
    }
    pushCommand(CommandType.AddComponent, addData)
  }

  const addComponentData = (data: IAddComponentData) => {
    pushCommand(CommandType.AddComponent, data)
  }

  const addBuiltinComponent = (id: string, parentId?: string) => {
    if (!activePage.value) {
      return
    }
    let parent: IComponent | undefined
    if (parentId) {
      parent = resolveComponent(site.value.context, parentId)
    }
    parent = parent ?? site.value.editor?.selectedComponent ?? activePage.value.root

    const builtinComponent = resolveComponent(site.value.context, id)
    const addBuiltinComponentData = makeAddBuiltinComponentData(
      site.value,
      id,
      parent,
      site.value.editor?.selectedComponent?.id,
    )
    if (!addBuiltinComponentData) {
      return
    }
    pushCommandAndAddMissingMixins(
      CommandType.AddComponent,
      addBuiltinComponentData,
      builtinComponent?.style.mixins,
    )
  }

  const pushCommandAndAddMissingMixins = <Data>(
    type: CommandType,
    data: Data,
    builtinMixinIds: string[] | undefined,
  ) => {
    const commands: ICommand[] = [{ type, data }]

    builtinMixinIds?.forEach((mixinId) => {
      const builtinStyle = builtinStyles[mixinId]
      const alreadyExists = !!resolveStyle(site.value.context, mixinId)
      if (!alreadyExists) {
        const addMixinData: IAddStyleMixinData = structuredClone(builtinStyle)
        commands.push({
          type: CommandType.AddStyleMixin,
          data: addMixinData,
        })
      }
    })

    pushCommand(CommandType.Group, { commands } as ICommandGroupData)
  }

  const editComponent = (
    component: IComponent | undefined,
    fields: IEditComponentFields,
  ) => {
    const keys = Object.keys(fields)
    if (!activePage.value || !component || keys.length === 0) {
      return
    }
    const data = makeEditComponentData(component, fields)
    const lastCommand = getLastCommand()
    if (lastCommand?.type === CommandType.EditComponent) {
      const lastCommandData = lastCommand.data as IEditComponentData
      if (
        lastCommandData.id === component.id &&
        keys.every(
          (k) => lastCommandData.new[k as keyof IEditComponentFields] !== undefined,
        )
      ) {
        const dataToReplace: IEditComponentData = {
          id: component.id,
          new: fields,
          old: lastCommandData.old,
        }
        replaceLastCommand(CommandType.EditComponent, dataToReplace)
        return
      }
    }
    pushCommand(CommandType.EditComponent, data)
  }

  const editSelectedComponent = (fields: IEditComponentFields) => {
    const component = site.value.editor?.selectedComponent
    editComponent(component, fields)
  }

  const duplicateComponent = () => {
    const component = site.value.editor?.selectedComponent
    if (!activePage.value || !component) {
      return
    }
    const parent = component.parent
    const index = parent?.children?.findIndex((c) => c.id === component.id)
    const data: IAddComponentData = {
      name: component.name,
      tag: component.tag,
      content: component.content,
      sourceId: component.id,
      parentId: parent?.id ?? activePage.value.root.id,
      // Place after selected component
      parentIndex: index === undefined ? undefined : index + 1,
    }
    pushCommand(CommandType.AddComponent, data)
  }

  const pasteComponent = (copiedComponentId: string, parent: IComponent) => {
    const copiedComponent = resolveComponent(site.value.context, copiedComponentId)
    if (!copiedComponent) return

    const data: IAddComponentData = {
      tag: copiedComponent.tag,
      content: copiedComponent.content,
      sourceId: copiedComponent.id,
      name: copiedComponent.name,
      ...selectAddParent(parent, activePage.value?.root.id),
    }
    pushCommand(CommandType.AddComponent, data)
  }

  const replacePageRoot = (copiedComponentId: string, pageRoute: string) => {
    const copiedComponent = resolveComponent(site.value.context, copiedComponentId)
    if (!copiedComponent) return

    const page = site.value.pages[pageRoute]
    if (!page) {
      throw new Error(`Cannot find page with route ${pageRoute}`)
    }

    const data: IReplacePageRootData = {
      pageRoute: page.route,
      oldRoot: makeRemoveComponentData(site.value, page.root, true),
      replacementComponent: {
        name: copiedComponent.name,
        tag: copiedComponent.tag,
        content: copiedComponent.content,
        sourceId: copiedComponent.id,
        parentId: '',
      },
    }
    pushCommand(CommandType.ReplacePageRoot, data)
  }

  const setPositionAbsolute = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
  ) => {
    const pseudoClass = newStyle.pseudoClass
    const selected = site.value.editor?.selectedComponent
    if (!selected) {
      return
    }
    const parent = selected.parent
    const parentPosition = resolvedComponentStyle(
      site.value.context,
      parent,
      pseudoClass,
      Css.Position,
      activeBreakpoint.value.id,
    )
    // No action if parent already has relative position
    if (!parent || parentPosition === 'relative' || parentPosition === 'absolute') {
      setComponentCustomStyle(oldStyle, newStyle)
    } else {
      const oldValue =
        parent.style.custom[activeBreakpoint.value.id][pseudoClass]?.[Css.Position]
      const data: ICommandGroupData = {
        commands: [
          {
            type: CommandType.SetComponentCustomStyle,
            data: {
              componentId: selected.id,
              breakpointId: activeBreakpoint.value.id,
              oldStyle,
              newStyle,
            },
          },
          {
            type: CommandType.SetComponentCustomStyle,
            data: {
              componentId: parent.id,
              breakpointId: activeBreakpoint.value.id,
              oldStyle: oldValue
                ? {
                    pseudoClass,
                    property: Css.Position,
                    value: oldValue,
                  }
                : undefined,
              newStyle: {
                pseudoClass,
                property: Css.Position,
                value: 'relative',
              },
            },
          },
        ],
      }
      pushCommand(CommandType.Group, data)
    }
  }

  const setCustomStyle = (
    component: IComponent,
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
    replace = false,
  ) => {
    const data: ISetComponentCustomStyleData = {
      componentId: component.id,
      breakpointId: activeBreakpoint.value.id,
      oldStyle,
      newStyle,
    }
    if (replace) {
      // Keep the original "old" data in a chain of commands
      const lastCommand = getLastCommand()
      const oldStyle = (lastCommand?.data as ISetComponentCustomStyleData | undefined)
        ?.oldStyle
      replaceLastCommand(CommandType.SetComponentCustomStyle, {
        ...data,
        oldStyle: oldStyle ?? data.oldStyle,
      })
    } else {
      pushCommand(CommandType.SetComponentCustomStyle, data)
    }
  }

  const setCustomStyles = (
    component: IComponent,
    styles: IOldNewStyleEntry[],
    replace?: boolean,
  ) => {
    const data: ICommandGroupData = {
      commands: styles.map((style) => {
        const setCustomStyleData: ISetComponentCustomStyleData = {
          componentId: component.id,
          breakpointId: activeBreakpoint.value.id,
          oldStyle: style.oldStyle,
          newStyle: style.newStyle,
        }
        return {
          type: CommandType.SetComponentCustomStyle,
          data: setCustomStyleData,
        }
      }),
    }
    if (replace) {
      replaceLastCommand(CommandType.Group, data)
    } else {
      pushCommand(CommandType.Group, data)
    }
  }

  const setComponentCustomStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
    replace = false,
  ) => {
    const selected = site.value.editor?.selectedComponent
    if (selected) {
      setCustomStyle(selected, oldStyle, newStyle, replace)
    }
  }

  const removeComponentCustomStyle = (style: IRemoveStyleEntry) => {
    const selected = site.value.editor?.selectedComponent
    const oldValue =
      selected?.style.custom[activeBreakpoint.value.id]?.[style.pseudoClass]?.[
        style.property
      ]
    if (!oldValue) {
      return
    }
    const data: ISetComponentCustomStyleData = {
      componentId: selected.id,
      breakpointId: activeBreakpoint.value.id,
      oldStyle: {
        ...style,
        value: oldValue,
      },
    }
    pushCommand(CommandType.SetComponentCustomStyle, data)
  }

  const mergeComponentStyle = (from: ISerializedComponent) => {
    const selected = site.value.editor?.selectedComponent
    if (selected) {
      const data: IMergeComponentStyleData = {
        componentId: selected.id,
        oldStyle: structuredClone(toRaw(selected.style)),
        newStyle: flattenedComponentStyle(from),
      }
      pushCommand(CommandType.MergeComponentStyle, data)
    }
  }

  const setOverrideStyle = (
    selector: string,
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry,
  ) => {
    const selected = site.value.editor?.selectedComponent
    if (selected) {
      const data: ISetComponentOverrideStyleData = {
        componentId: selected.id,
        selector,
        breakpointId: activeBreakpoint.value.id,
        oldStyle,
        newStyle,
      }
      pushCommand(CommandType.SetComponentOverrideStyle, data)
    }
  }

  const removeComponentOverrideStyleEntry = (
    selector: string,
    style: IRemoveStyleEntry,
  ) => {
    const selected = site.value.editor?.selectedComponent
    const oldValue =
      selected?.style.overrides?.[selector][activeBreakpoint.value.id][
        style.pseudoClass
      ]?.[style.property]
    if (!oldValue) {
      return
    }
    const data: ISetComponentOverrideStyleData = {
      componentId: selected.id,
      breakpointId: activeBreakpoint.value.id,
      selector: selector,
      oldStyle: {
        ...style,
        value: oldValue,
      },
    }
    pushCommand(CommandType.SetComponentOverrideStyle, data)
  }

  const removeComponentOverrideStyle = (selector: string) => {
    const selected = site.value.editor?.selectedComponent
    if (selected) {
      const styles = structuredClone(toRaw(selected.style.overrides?.[selector]) ?? {})
      const data: IRemoveComponentOverrideStyleData = {
        selector,
        componentId: selected.id,
        styles,
      }
      pushCommand(CommandType.RemoveComponentOverrideStyle, data)
    }
  }

  const addComponentMixin = (mixinId: string) => {
    const selected = site.value.editor?.selectedComponent
    if (!selected || selected.style.mixins?.includes(mixinId)) {
      return
    }
    const data: IAddComponentMixinData = {
      componentId: selected.id,
      mixinId,
    }
    pushCommandAndAddMissingMixins(CommandType.AddComponentMixin, data, [mixinId])
  }

  const removeComponentMixin = (mixinId: string) => {
    const selected = site.value.editor?.selectedComponent
    if (!selected || !selected.style.mixins?.includes(mixinId)) {
      return
    }
    const data: IRemoveComponentMixinData = {
      componentId: selected.id,
      mixinId,
    }
    pushCommand(CommandType.RemoveComponentMixin, data)
  }

  const replaceComponentMixin = (oldMixinId: string, newMixinId: string) => {
    const selected = site.value.editor?.selectedComponent
    if (
      !selected ||
      oldMixinId === newMixinId ||
      selected.style.mixins?.includes(newMixinId) ||
      !selected.style.mixins?.includes(oldMixinId)
    ) {
      return
    }

    const replaceComponentMixinData: IReplaceComponentMixinData = {
      componentId: selected.id,
      oldMixinId,
      newMixinId,
    }
    pushCommandAndAddMissingMixins(
      CommandType.ReplaceComponentMixin,
      replaceComponentMixinData,
      [newMixinId],
    )
  }

  const addComponentEvent = (newEvent: IComponentEvent) => {
    const selected = site.value.editor?.selectedComponent
    const oldEvent = selected?.events?.[newEvent.name]
    if (!selected) {
      return
    }
    const data: ISetComponentEventData = {
      componentId: selected.id,
      oldEvent,
      newEvent,
    }
    pushCommand(CommandType.SetComponentEvent, data)
  }

  const updateComponentEvent = (oldEventName: string, newEvent: IComponentEvent) => {
    // TODO -- don't update if event is unchanged
    const selected = site.value.editor?.selectedComponent
    const oldEvent = selected?.events?.[oldEventName]
    if (!selected) {
      return
    }
    const data: ISetComponentEventData = {
      componentId: selected.id,
      oldEvent,
      newEvent,
    }
    pushCommand(CommandType.SetComponentEvent, data)
  }

  const removeComponentEvent = (name: string) => {
    const selected = site.value.editor?.selectedComponent
    const oldEvent = selected?.events?.[name]
    if (!selected) {
      return
    }
    const data: ISetComponentEventData = {
      componentId: selected.id,
      oldEvent,
      newEvent: undefined,
    }
    pushCommand(CommandType.SetComponentEvent, data)
  }

  const addOrUpdateComponentInput = (
    property: string,
    payload: Partial<IComponentInput>,
  ) => {
    const selected = site.value.editor?.selectedComponent
    const data = makeSetInputData(selected, property, payload)
    if (data) {
      pushCommand(CommandType.SetComponentInput, data)
    }
  }

  const removeComponentInput = (name: string) => {
    const selected = site.value.editor?.selectedComponent
    const oldInput = selected?.inputs?.[name]
    if (!selected) {
      return
    }
    const data: ISetComponentInputData = {
      componentId: selected.id,
      oldInput,
      newInput: undefined,
    }
    pushCommand(CommandType.SetComponentInput, data)
  }

  const setBehavior = (behavior: IBehavior) => {
    const oldBehavior = site.value.context.behaviors[behavior.id]
    const data: ISetBehaviorData = {
      oldBehavior,
      newBehavior: behavior,
    }
    pushCommand(CommandType.SetBehavior, data)
  }

  const removeBehavior = (id: string) => {
    const oldBehavior = site.value.context.behaviors[id]
    if (oldBehavior) {
      const data: ISetBehaviorData = {
        oldBehavior,
        newBehavior: undefined,
      }
      pushCommand(CommandType.SetBehavior, data)
    }
  }

  const setBehaviorArg = (
    id: string,
    oldArg: IBehaviorArg | undefined,
    newArg: IBehaviorArg | undefined,
  ) => {
    if (oldArg === newArg) {
      return
    }
    const data: ISetBehaviorArgData = {
      behaviorId: id,
      oldArg,
      newArg,
    }
    pushCommand(CommandType.SetBehaviorArg, data)
  }

  const setSelectedIsInput = (prop: string, newValue: unknown) => {
    const selected = site.value.editor?.selectedComponent
    const data = makeSetInputData(selected, prop, {
      is: newValue,
    })
    if (data) {
      pushCommand(CommandType.SetComponentInput, data)
    }
  }

  const addStyle = (style: IStyle) => {
    const data: IAddStyleMixinData = {
      name: style.name,
      breakpoints: style.breakpoints,
    }
    pushCommand(CommandType.AddStyleMixin, data)
  }

  const flattenComponentMixin = (componentId: string, mixinId: string) => {
    const component = resolveComponent(site.value.context, componentId)
    const mixin = site.value.context.styles[mixinId]
    if (component && mixin) {
      const removeMixinData: IRemoveComponentMixinData = {
        componentId,
        mixinId,
      }
      const removeMixin: ICommand = {
        type: CommandType.RemoveComponentMixin,
        data: removeMixinData,
      }
      // Build array of set-component-custom-style commands
      const commands: ICommand[] = [removeMixin]
      for (const [bpId, bp] of Object.entries(mixin.breakpoints)) {
        for (const [pClass, pseudo] of Object.entries(bp)) {
          const pseudoClass = pClass as CssPseudoClass
          for (const [prop, val] of Object.entries(pseudo)) {
            const css = prop as Css
            const oldValue = component.style.custom[bpId]?.[pseudoClass]?.[css]
            if (val === oldValue) {
              // Skip if component already has the same style as the mixin
              continue
            }
            const styleData: ISetComponentCustomStyleData = {
              componentId,
              breakpointId: bpId,
              oldStyle:
                oldValue === undefined
                  ? undefined
                  : {
                      pseudoClass,
                      property: css,
                      value: oldValue,
                    },
              newStyle: {
                pseudoClass,
                property: css,
                value: val,
              },
            }
            commands.push({
              type: CommandType.SetComponentCustomStyle,
              data: styleData,
            })
          }
        }
      }
      if (commands.length) {
        const data: ICommandGroupData = {
          commands,
        }
        pushCommand(CommandType.Group, data)
      }
    }
  }

  const convertComponentStyle = (componentId: string, style: IStyle) => {
    const component = resolveComponent(site.value.context, componentId)
    if (component) {
      // Create the new mixin
      const styleData: IAddStyleMixinData = {
        name: style.name,
        breakpoints: style.breakpoints,
      }
      // Add the new mixin to the component
      const { nextId, namespace } = site.value.context
      const addToComponent: IAddComponentMixinData = {
        componentId,
        // Precalculate the expected mixin ID
        mixinId: styleId(namespace, nextId.toString()),
      }
      const commands: ICommand[] = [
        { type: CommandType.AddStyleMixin, data: styleData },
        { type: CommandType.AddComponentMixin, data: addToComponent },
      ]
      // Delete the old component styles
      for (const [bpId, bp] of Object.entries(component.style.custom)) {
        for (const [pClass, pseudo] of Object.entries(bp)) {
          const pseudoClass = pClass as CssPseudoClass
          for (const [prop, val] of Object.entries(pseudo)) {
            const pseudos = style.breakpoints[bpId]?.[pseudoClass]
            if (pseudos?.[prop as Css] !== undefined) {
              const styleData: ISetComponentCustomStyleData = {
                componentId,
                breakpointId: bpId,
                oldStyle: {
                  pseudoClass,
                  property: prop as Css,
                  value: val,
                },
                newStyle: undefined,
              }
              commands.push({
                type: CommandType.SetComponentCustomStyle,
                data: styleData,
              })
            }
          }
        }
      }
      const data: ICommandGroupData = {
        commands,
      }
      pushCommand(CommandType.Group, data)
    }
  }

  const editStyle = (style: IStyle) => {
    const oldStyle = structuredClone(toRaw(resolveStyle(site.value.context, style.id)))
    if (!oldStyle) {
      return
    }

    const newStyle = structuredClone(oldStyle)
    newStyle.name = style.name
    newStyle.breakpoints = style.breakpoints

    const data: IEditStyleMixinData = {
      oldStyle,
      newStyle,
    }
    pushCommand(CommandType.EditStyleMixin, data)
  }

  const deleteStyle = (style: IStyle) => {
    const data: IRemoveStyleMixinData = style
    pushCommand(CommandType.RemoveStyleMixin, data)
  }

  const setTranslations = (props: ISetTranslationsProps) => {
    const { code, translations, replace, forceSave } = props
    const data = makeSetTranslationsData(site.value.context, code, translations)
    if (replace) {
      replaceLastCommand(CommandType.SetTranslations, data, forceSave ?? false)
    } else {
      pushCommand(CommandType.SetTranslations, data)
    }
  }

  const setActiveI18n = (activeI18n: string) => {
    site.value.context.activeI18n = activeI18n
  }

  const addThemeVariable = (data: IAddThemeVariableData) => {
    pushCommand(CommandType.AddThemeVariable, data)
  }

  const editThemeVariable = (data: IEditThemeVariableData) => {
    pushCommand(CommandType.EditThemeVariable, data)
  }

  const deleteThemeVariable = (data: IRemoveThemeVariableData) => {
    pushCommand(CommandType.RemoveThemeVariable, data)
  }

  const addThemeFont = (
    source: ThemeFontSource,
    name: string,
    fallback?: WebSafeFont,
  ) => {
    const data: IAddThemeFontData = {
      source,
      name,
      fallback,
    }
    pushCommand(CommandType.AddThemeFont, data)
  }

  const editThemeFont = (oldFont: IThemeFont, newFont: IThemeFont) => {
    const data: IEditThemeFontData = {
      oldFont,
      newFont,
    }
    pushCommand(CommandType.EditThemeFont, data)
  }

  const deleteThemeFont = (font: IThemeFont) => {
    const data: IRemoveThemeFontData = {
      source: font.source,
      name: font.name,
    }
    pushCommand(CommandType.RemoveThemeFont, data)
  }

  const addPage = (metadata: IPageMetadata, copyFrom?: string) => {
    const { editor } = site.value
    if (editor) {
      let root: IAddComponentData | undefined
      if (copyFrom && site.value.pages[copyFrom]) {
        const copyCmp = site.value.pages[copyFrom].root
        root = {
          parentId: '',
          tag: copyCmp.tag,
          content: copyCmp.content,
          sourceId: copyCmp.id,
          name: copyCmp.name,
        }
      }
      const data: IAddPageData = {
        metadata,
        activePageRoute: editor.active,
        selectedComponentId: editor.selectedComponent?.id,
        root,
      }
      pushCommand(CommandType.AddPage, data)
    }
  }

  const editPage = (oldPage: IPageMetadata, newPage: IPageMetadata) => {
    const data: IEditPageData = {
      oldMetadata: oldPage,
      newMetadata: newPage,
    }
    pushCommand(CommandType.EditPage, data)
  }

  const removePage = (route: string) => {
    const { editor } = site.value
    if (editor) {
      const removedPage = site.value.pages[route]
      if (removedPage) {
        const data: IRemovePageData = {
          pageRoute: route,
          serializedPage: serializePage(removedPage),
          selectedComponentId: editor.selectedComponent?.id,
        }
        pushCommand(CommandType.RemovePage, data)
      }
    }
  }

  const changePage = (route: string) => {
    const { editor } = site.value
    if (editor) {
      const currentPage = editor.active
      const data: IChangePageData = {
        from: currentPage,
        to: route,
        selectedComponentId: editor.selectedComponent?.id,
      }
      pushCommand(CommandType.ChangePage, data)
    }
  }

  const setHomePage = (route: string) => {
    const data: ISetHomePageData = {
      oldRoute: site.value.defaults.homePage,
      newRoute: route,
    }
    pushCommand(CommandType.SetHomePage, data)
  }

  const deleteSelected = () => {
    const selected = site.value.editor?.selectedComponent
    const parent = selected?.parent
    // Cannot delete root component
    if (!activePage.value || !selected || !parent) {
      return
    }
    const data = makeRemoveComponentData(site.value, selected)
    pushCommand(CommandType.RemoveComponent, data)
    setSelectedComponent(site.value, parent)
  }

  const selectComponentParent = () => {
    const selected = site.value.editor?.selectedComponent
    const parent = selected?.parent
    setSelectedComponent(site.value, parent)
  }

  const moveComponent = (from: IComponentPosition, to: IComponentPosition) => {
    const data: IMoveComponentData = {
      from,
      to,
      selectedComponentId: editor.value?.selectedComponent?.id,
    }
    pushCommand(CommandType.MoveComponent, data)
  }

  const moveAbsoluteComponent = (component: IComponent, left: string, top: string) => {
    const pseudoClass = CssPseudoClass.Default
    const breakpointId = activeBreakpoint.value.id
    const oldLeft = component.style.custom[breakpointId]?.[pseudoClass]?.left
    const oldTop = component.style.custom[breakpointId]?.[pseudoClass]?.top
    const data: ICommandGroupData = {
      commands: [
        {
          type: CommandType.SetComponentCustomStyle,
          data: {
            componentId: component.id,
            breakpointId,
            oldStyle: oldLeft
              ? { pseudoClass, property: Css.Left, value: oldLeft }
              : undefined,
            newStyle: { pseudoClass, property: Css.Left, value: left },
          },
        },
        {
          type: CommandType.SetComponentCustomStyle,
          data: {
            componentId: component.id,
            breakpointId,
            oldStyle: oldTop
              ? {
                  pseudoClass,
                  property: Css.Top,
                  value: oldTop,
                }
              : undefined,
            newStyle: {
              pseudoClass,
              property: Css.Top,
              value: top,
            },
          },
        },
      ],
    }
    pushCommand(CommandType.Group, data)
  }

  const setFavicon = (newFavicon: string | undefined) => {
    const index =
      site.value.defaults.head.link?.findIndex((link) => link.rel === 'icon') ?? 0
    const oldValue = index === -1 ? undefined : site.value.defaults.head.link?.[index]
    const data: ISetDefaultsHeadData = {
      tag: 'link',
      index: index === -1 ? 0 : index,
      oldValue,
      newValue: {
        href: newFavicon,
        rel: 'icon',
      },
    }
    pushCommand(CommandType.SetDefaultsHead, data)
  }

  const addDefaultsHead = (tag: IHeadTag, value: IHeadObject) => {
    const data: ISetDefaultsHeadData = {
      tag,
      index: 0,
      newValue: value,
    }
    pushCommand(CommandType.SetDefaultsHead, data)
  }

  const setDefaultsHead = (tag: IHeadTag, index: number, value: IHeadObject) => {
    let oldValue: IHeadObject | undefined
    if (tag === 'base') {
      oldValue = site.value.defaults.head.base
    } else {
      oldValue = site.value.defaults.head[tag]?.[index] as IHeadObject
    }
    const data: ISetDefaultsHeadData = {
      tag,
      index,
      oldValue,
      newValue: value,
    }
    pushCommand(CommandType.SetDefaultsHead, data)
  }

  const removeDefaultsHead = (tag: IHeadTag, index: number) => {
    let oldValue: IHeadObject | undefined
    if (tag === 'base') {
      oldValue = site.value.defaults.head.base
    } else {
      oldValue = site.value.defaults.head[tag]?.[index] as IHeadObject
    }
    const data: ISetDefaultsHeadData = {
      tag,
      index,
      oldValue,
    }
    pushCommand(CommandType.SetDefaultsHead, data)
  }

  const addPageHead = (route: string, tag: IPageHeadTag, value: IHeadObject | string) => {
    const data: ISetPageHeadData = {
      route,
      tag,
      index: 0,
      newValue: value,
    }
    pushCommand(CommandType.SetPageHead, data)
  }

  const setPageHead = (
    route: string,
    tag: IPageHeadTag,
    index: number,
    value: IHeadObject | string,
  ) => {
    let oldValue: IHeadObject | string | undefined
    if (tag === 'title') {
      oldValue = site.value.pages[route]?.head.title
    } else {
      oldValue = site.value.pages[route]?.head[tag]?.[index]
    }

    const data: ISetPageHeadData = {
      route,
      tag,
      index,
      oldValue,
      newValue: value,
    }
    pushCommand(CommandType.SetPageHead, data)
  }

  const removePageHead = (route: string, tag: IPageHeadTag, index: number) => {
    let oldValue: IHeadObject | string | undefined
    if (tag === 'title') {
      oldValue = site.value.pages[route]?.head.title
    } else {
      oldValue = site.value.pages[route]?.head[tag]?.[index]
    }

    const data: ISetPageHeadData = {
      route,
      tag,
      index,
      oldValue,
    }
    pushCommand(CommandType.SetPageHead, data)
  }

  const setPageFavicon = (route: string, newFavicon: string | undefined) => {
    const page = site.value.pages[route]
    if (page) {
      const index = page.head.link?.findIndex((link) => link.rel === 'icon') ?? 0
      const oldValue = index === -1 ? undefined : page.head.link?.[index]
      const data: ISetPageHeadData = {
        route: page.route,
        tag: 'link',
        index: index === -1 ? 0 : index,
        oldValue,
        newValue: {
          href: newFavicon,
          rel: 'icon',
        },
      }
      pushCommand(CommandType.SetPageHead, data)
    }
  }

  const setBreakpoint = (newBreakpoints: Record<string, IBreakpoint>) => {
    const oldBreakpoints = Object.keys(site.value.context.breakpoints).reduce(
      (record, breakpointId) => {
        record[breakpointId] = structuredClone(
          toRaw(site.value.context.breakpoints[breakpointId]),
        )
        return record
      },
      {} as Record<string, IBreakpoint>,
    )
    const data: ISetBreakpointData = {
      oldBreakpoints,
      newBreakpoints,
    }
    pushCommand(CommandType.SetBreakpoint, data)
  }

  const pushGroupCommands = (data: ICommandGroupData) => {
    pushCommand(CommandType.Group, data)
  }

  return {
    site,
    siteError,
    editor,
    currentPseudoClass,
    selectedComponentFlattenedStyles,
    activePage,
    commandAlert,
    clearSiteError,
    resetSite,
    replaceSite,
    addComponent,
    addComponentData,
    duplicateComponent,
    pasteComponent,
    replacePageRoot,
    addBuiltinComponent,
    editComponent,
    editSelectedComponent,
    setCustomStyle,
    setCustomStyles,
    setComponentCustomStyle,
    setPositionAbsolute,
    removeComponentCustomStyle,
    setOverrideStyle,
    removeComponentOverrideStyleEntry,
    removeComponentOverrideStyle,
    mergeComponentStyle,
    addComponentMixin,
    removeComponentMixin,
    replaceComponentMixin,
    addComponentEvent,
    updateComponentEvent,
    removeComponentEvent,
    addOrUpdateComponentInput,
    removeComponentInput,
    setSelectedIsInput,
    deleteSelected,
    selectComponentParent,
    setBehavior,
    removeBehavior,
    setBehaviorArg,
    addStyle,
    convertComponentStyle,
    flattenComponentMixin,
    editStyle,
    deleteStyle,
    setTranslations,
    setActiveI18n,
    addThemeVariable,
    editThemeVariable,
    deleteThemeVariable,
    addThemeFont,
    editThemeFont,
    deleteThemeFont,
    addPage,
    editPage,
    removePage,
    changePage,
    setHomePage,
    moveComponent,
    moveAbsoluteComponent,
    setFavicon,
    addDefaultsHead,
    setDefaultsHead,
    removeDefaultsHead,
    addPageHead,
    setPageHead,
    removePageHead,
    setPageFavicon,
    setBreakpoint,
    pushGroupCommands,
  }
}
