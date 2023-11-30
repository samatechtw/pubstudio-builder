import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import {
  firstMarkInSelection,
  isMarkInSelection,
  replaceMark,
  schemaText as schema,
  setOrRemoveStyleMark,
} from '@pubstudio/frontend/util-edit-text'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import {
  Css,
  IRawStyleWithSource,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { toggleMark } from 'prosemirror-commands'
import { Command } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { reactive, toRaw, UnwrapNestedRefs, watch } from 'vue'
import { editViewTxCount } from './create-editor-view'
import { useBuild } from './use-build'

export interface IUseToolbar {
  selectionStyles: UnwrapNestedRefs<IEditViewSelectionStyles>
  getRawStyle(property: Css): string | undefined
  getRawOrSelectedStyle(property: Css): string | undefined
  getResolvedOrSelectedStyle(property: Css): IRawStyleWithSource | undefined
  getStyleValue(property: Css): string | undefined
  getResolvedStyle(property: Css): IRawStyleWithSource | undefined
  setStyle(property: Css, value: string | undefined, replace?: boolean): void
  setProseMirrorStyle(view: EditorView, property: Css, value: string | undefined): void
  createSetComponentCustomStyleCommand(
    property: Css,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData> | undefined
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
    setComponentCustomStyle,
  } = useBuild()

  const getRawStyle = (property: Css): string | undefined => {
    return selectedComponentFlattenedStyles.value[property]?.value ?? ''
  }

  const getRawOrSelectedStyle = (property: Css): string | undefined => {
    const view = editor.value?.editView
    if (view) {
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
        const parentStyle = getStyleValue(Css.FontWeight)
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

  const setStyle = (property: Css, value: string | undefined, replace?: boolean) => {
    const editView = editor.value?.editView
    if (!editor.value?.editView?.state.selection?.empty) {
      editor.value?.editView?.focus()
    }
    if (property in selectionStyles && editView?.hasFocus()) {
      setProseMirrorStyle(editView, property, value)
    } else if (value === undefined) {
      removeComponentCustomStyle({
        property,
        pseudoClass: currentPseudoClass.value,
      })
    } else {
      let currentStyle: IStyleEntry | undefined = undefined

      const currentValue = getStyleValue(property)
      if (currentValue) {
        currentStyle = {
          pseudoClass: currentPseudoClass.value,
          property,
          value: currentValue,
        }
      }

      setComponentCustomStyle(
        currentStyle,
        {
          pseudoClass: currentPseudoClass.value,
          property,
          value,
        },
        replace,
      )
    }
  }

  const createSetComponentCustomStyleCommand = (
    property: Css,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData> | undefined => {
    const { selectedComponent } = editor.value ?? {}
    if (!selectedComponent) {
      throw new Error(
        'Cannot create set component custom style command when no component is selected',
      )
    }
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
          }
        : undefined,
      newStyle: newValue
        ? {
            pseudoClass: currentPseudoClass.value,
            property,
            value: newValue,
          }
        : undefined,
    }
    return {
      type: CommandType.SetComponentCustomStyle,
      data,
    }
  }

  return {
    selectionStyles,
    getRawStyle,
    getRawOrSelectedStyle,
    getResolvedOrSelectedStyle,
    getStyleValue,
    getResolvedStyle,
    setStyle,
    setProseMirrorStyle,
    createSetComponentCustomStyleCommand,
  }
}
