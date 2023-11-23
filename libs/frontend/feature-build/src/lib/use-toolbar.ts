import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import {
  Css,
  IRawStyleWithSource,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { useBuild } from './use-build'

export interface IUseToolbar {
  getRawStyle(property: Css): string | undefined
  getStyleValue(property: Css): string | undefined
  getResolvedStyle(property: Css): IRawStyleWithSource | undefined
  setStyle(property: Css, value: string | undefined, replace?: boolean): void
  createSetComponentCustomStyleCommand(
    property: Css,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData> | undefined
}

export const useToolbar = (): IUseToolbar => {
  const {
    site,
    editor,
    currentPseudoClass,
    selectedComponentFlattenedStyles,
    removeComponentCustomStyle,
    setComponentCustomStyle,
  } = useBuild()

  const getRawStyle = (property: Css): string | undefined => {
    return selectedComponentFlattenedStyles.value[property]?.value ?? ''
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

  const setStyle = (property: Css, value: string | undefined, replace?: boolean) => {
    if (value === undefined) {
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
    getRawStyle,
    getStyleValue,
    getResolvedStyle,
    setStyle,
    createSetComponentCustomStyleCommand,
  }
}
