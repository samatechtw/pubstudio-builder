import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import {
  getLastCommand,
  pushOrReplaceCommand,
  replaceLastCommand,
} from '@pubstudio/frontend/util-command'
import {
  firstMarkInSelection,
  isMarkInSelection,
  prosemirrorEditing,
  replaceMark,
  schemaText as schema,
  setOrRemoveStyleMark,
  toggleMark,
} from '@pubstudio/frontend/util-edit-text'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import {
  Css,
  IRawStyleWithSource,
  IStyleEntryWithInherited,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { Command } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { computed, ComputedRef, reactive, toRaw, UnwrapNestedRefs, watch } from 'vue'
import { setCustomStyleCommand } from './build-command-helpers'
import { editViewTxCount } from './create-editor-view'
import { useBuild } from './use-build'

export interface IUseToolbar {
  selectionStyles: UnwrapNestedRefs<IEditViewSelectionStyles>
  isProsemirrorEditing: ComputedRef<boolean>
  getRawStyle(property: Css): string | undefined
  getRawOrSelectedStyle(property: Css): string | undefined
  getResolvedOrSelectedStyle(property: Css): IRawStyleWithSource | undefined
  getStyleValue(property: Css): string | undefined
  getResolvedStyle(property: Css): IRawStyleWithSource | undefined
  setStyle(property: Css, value: string | undefined): void
  setOrRemoveStyle(property: Css, value: string | undefined, replace?: boolean): void
  setStyleOrReplace(property: Css, value: string | undefined): void
  toggleStyle(prop: Css, value: string): void
  setStyleEnsureFlex: (prop: Css, value: string | undefined) => void
  setProseMirrorStyle(view: EditorView, property: Css, value: string | undefined): void
  createSetComponentCustomStyleCommand(
    property: Css,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData> | undefined
  refocusSelection(): void
}

export interface IEditViewSelectionStyles {
  [Css.FontFamily]: string | undefined
  [Css.FontSize]: string | undefined
  [Css.TextDecoration]: string | undefined
  [Css.FontStyle]: string | undefined
  [Css.FontWeight]: string | undefined
  [Css.Color]: string | undefined
  [Css.BackgroundColor]: string | undefined
}

const { site } = useSiteSource()

const selectionStyles = reactive<IEditViewSelectionStyles>({
  [Css.FontFamily]: undefined,
  [Css.FontSize]: undefined,
  [Css.TextDecoration]: undefined,
  [Css.FontStyle]: undefined,
  [Css.FontWeight]: undefined,
  [Css.Color]: undefined,
  [Css.BackgroundColor]: undefined,
})

watch(editViewTxCount, (newCount, oldCount) => {
  // TODO -- is it more efficient to detect the type of ProseMirror transaction
  // to avoid recomputing too often?
  const view = toRaw(site.value.editor?.editView)
  const state = view?.state
  if (newCount !== oldCount && view) {
    selectionStyles[Css.TextDecoration] = isMarkInSelection(view, schema.marks.u)
      ? 'underline'
      : undefined

    selectionStyles[Css.FontStyle] = isMarkInSelection(view, schema.marks.em)
      ? 'italic'
      : undefined

    const colorMark = firstMarkInSelection(state, schema.marks.color)
    selectionStyles[Css.Color] = colorMark?.attrs.color

    const bgMark = firstMarkInSelection(state, schema.marks.bg)
    selectionStyles[Css.BackgroundColor] = bgMark?.attrs[Css.BackgroundColor]

    const weightMark = firstMarkInSelection(state, schema.marks.strong)
    selectionStyles[Css.FontWeight] = weightMark?.attrs[Css.FontWeight]

    const fontMark = firstMarkInSelection(state, schema.marks.font)
    selectionStyles[Css.FontFamily] = fontMark?.attrs[Css.FontFamily]

    const sizeMark = firstMarkInSelection(state, schema.marks.size)
    selectionStyles[Css.FontSize] = sizeMark?.attrs[Css.FontSize]
  }
})

export const useToolbar = (): IUseToolbar => {
  const {
    editor,
    currentPseudoClass,
    selectedComponentFlattenedStyles,
    removeComponentCustomStyle,
    getSelectedComponent,
  } = useBuild()

  const isProsemirrorEditing = computed(() => {
    return prosemirrorEditing(editor.value)
  })

  const getRawStyle = (property: Css): string | undefined => {
    return selectedComponentFlattenedStyles.value[property]?.value ?? ''
  }

  const getRawOrSelectedStyle = (property: Css): string | undefined => {
    const selColor = selectionStyles[property as keyof typeof selectionStyles]
    if (isProsemirrorEditing.value && selColor !== undefined) {
      return selectionStyles[property as keyof typeof selectionStyles]
    } else {
      return getRawStyle(property)
    }
  }

  const getResolvedOrSelectedStyle = (property: Css): IRawStyleWithSource | undefined => {
    const view = editor.value?.editView
    const resolved = getResolvedStyle(property)
    if (view) {
      // Mimic raw style
      return {
        value:
          selectionStyles[property as keyof typeof selectionStyles] ??
          resolved?.value ??
          '',
        sourceType: StyleSourceType.Custom,
        sourceId: resolved?.sourceId ?? '',
        sourceBreakpointId: resolved?.sourceBreakpointId ?? '',
      }
    } else {
      return resolved
    }
  }

  const getStyleValue = (property: Css): string | undefined => {
    const value = selectedComponentFlattenedStyles.value[property]?.value ?? ''
    return resolveThemeVariables(site.value.context, value)
  }

  const getResolvedStyle = (property: Css): IRawStyleWithSource | undefined => {
    const style = selectedComponentFlattenedStyles.value[property]
    if (style) {
      const resolved = resolveThemeVariables(site.value.context, style.value)
      if (resolved) {
        style.value = resolved
      }
    }
    return style
  }

  const setProseMirrorStyle = (
    view: EditorView,
    property: Css,
    value: string | undefined,
  ) => {
    let cmd: Command | undefined = undefined
    switch (property) {
      case Css.FontStyle: {
        if (value === 'italic') {
          cmd = toggleMark(schema.marks.em)
        }
        break
      }
      case Css.TextDecoration: {
        if (value === 'underline') {
          cmd = toggleMark(schema.marks.u)
        }
        break
      }
      case Css.Color: {
        cmd = replaceMark(schema.marks.color, { color: value })
        break
      }
      case Css.BackgroundColor: {
        cmd = replaceMark(schema.marks.bg, { 'background-color': value })
        break
      }
      case Css.FontSize: {
        cmd = replaceMark(schema.marks.size, { 'font-size': value })
        break
      }
      case Css.FontWeight: {
        const parentStyle = getStyleValue(Css.FontWeight)
        cmd = setOrRemoveStyleMark(
          schema.marks.strong,
          Css.FontWeight,
          value,
          parentStyle,
        )
        break
      }
      case Css.FontFamily: {
        const parentStyle = getStyleValue(Css.FontFamily)
        cmd = setOrRemoveStyleMark(schema.marks.font, Css.FontFamily, value, parentStyle)
        break
      }
    }
    if (cmd) {
      // toRaw is necessary because ProseMirror doesn't behave well when proxied
      // eslint-disable-next-line max-len
      // https://discuss.prosemirror.net/t/getting-rangeerror-applying-a-mismatched-transaction-even-with-trivial-code/4948/6
      const v = toRaw(view)
      cmd(v.state, v.dispatch, v)
    }
  }

  const setStyleCommand = (property: Css, value: string, replace?: boolean): ICommand => {
    let currentStyle: IStyleEntryWithInherited | undefined = undefined

    const currentValue = selectedComponentFlattenedStyles.value[property]
    if (currentValue?.value) {
      currentStyle = {
        pseudoClass: currentPseudoClass.value,
        property,
        value: currentValue.value,
        inherited: currentValue.sourceType !== StyleSourceType.Custom,
      }
    }

    return setCustomStyleCommand(
      site.value,
      getSelectedComponent(),
      currentStyle,
      {
        pseudoClass: currentPseudoClass.value,
        property,
        value,
        inherited: false,
      },
      replace,
    )
  }

  // Set a style property, and replace the last command if it affected the same property
  // Not command is issued or modified if the property is unchanged
  const setStyleOrReplace = (property: Css, value: string | undefined) => {
    if (getStyleValue(property) !== value) {
      let replace = false
      const lastCmd = getLastCommand(site.value)
      if (value !== undefined && lastCmd?.type === CommandType.SetComponentCustomStyle) {
        const prevNewStyle = (lastCmd?.data as ISetComponentCustomStyleData | undefined)
          ?.newStyle
        // Replace the last command if it's s Flex style update with match pseudoClass
        if (
          prevNewStyle?.property === property &&
          prevNewStyle?.pseudoClass === currentPseudoClass.value
        ) {
          replace = true
        }
      }
      setOrRemoveStyle(property, value, replace)
    }
  }

  const setOrRemoveStyle = (
    property: Css,
    value: string | undefined,
    replace?: boolean,
  ) => {
    if (value === undefined) {
      removeComponentCustomStyle({
        property,
        pseudoClass: currentPseudoClass.value,
      })
    } else {
      const cmd = setStyleCommand(property, value, replace)
      pushOrReplaceCommand(site.value, cmd, !!replace)
    }
  }

  const setStyle = (property: Css, value: string | undefined) => {
    const editView = editor.value?.editView
    if (!editor.value?.editView?.state.selection?.empty) {
      editor.value?.editView?.focus()
    }
    if (property in selectionStyles && editView?.hasFocus()) {
      setProseMirrorStyle(editView, property, value)
    } else {
      setOrRemoveStyle(property, value)
    }
  }

  // Sets a style, or un-sets it if the current value matches the new one.
  const toggleStyle = (prop: Css, value: string) => {
    if (getStyleValue(prop) === value) {
      setStyle(prop, undefined)
    } else {
      setStyle(prop, value)
    }
  }

  const setStyleEnsureFlex = (prop: Css, value: string | undefined) => {
    setOrRemoveStyle(prop, value)
    if (value !== undefined && getStyleValue(Css.Display) !== 'flex') {
      const cmd = getLastCommand(site.value)
      if (cmd) {
        const flexCmd = setStyleCommand(Css.Display, 'flex')
        const flexGroup: ICommand<ICommandGroupData> = {
          type: CommandType.Group,
          data: {
            commands: [flexCmd, cmd],
          },
        }
        replaceLastCommand(site.value, flexGroup, true)
      }
    }
  }

  const createSetComponentCustomStyleCommand = (
    property: Css,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData> | undefined => {
    const selectedComponent = getSelectedComponent()
    const oldStyle = selectedComponentFlattenedStyles.value[property]
    // Style inherited from mixin should not be set as oldStyle,
    // otherwise undo will create a duplicate custom style that didn't exist before
    const oldValue =
      oldStyle?.sourceType === StyleSourceType.Custom ? oldStyle.value : undefined

    if (!oldValue && !newValue) {
      return undefined
    }
    const data: ISetComponentCustomStyleData = {
      breakpointId: activeBreakpoint.value.id,
      componentId: selectedComponent.id,
      oldStyle: oldValue
        ? {
            pseudoClass: currentPseudoClass.value,
            property,
            value: oldValue,
            inherited: !!oldStyle && oldStyle.sourceType !== StyleSourceType.Custom,
          }
        : undefined,
      newStyle: newValue
        ? {
            pseudoClass: currentPseudoClass.value,
            property,
            value: newValue,
            inherited: false,
          }
        : undefined,
    }
    return {
      type: CommandType.SetComponentCustomStyle,
      data,
    }
  }

  const refocusSelection = () => {
    if (isProsemirrorEditing.value) {
      editor.value?.editView?.focus()
    }
  }

  return {
    selectionStyles,
    isProsemirrorEditing,
    getRawStyle,
    getRawOrSelectedStyle,
    getResolvedOrSelectedStyle,
    getStyleValue,
    getResolvedStyle,
    setStyle,
    setOrRemoveStyle,
    setStyleOrReplace,
    toggleStyle,
    setStyleEnsureFlex,
    setProseMirrorStyle,
    createSetComponentCustomStyleCommand,
    refocusSelection,
  }
}
