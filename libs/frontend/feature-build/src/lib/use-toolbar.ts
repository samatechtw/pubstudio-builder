import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import { Css, IRawStyleWithSource, IStyleEntry } from '@pubstudio/shared/type-site'
import { useBuild } from './use-build'

export interface IUseToolbar {
  getStyleValue(property: Css): string | undefined
  getResolvedStyle(property: Css): IRawStyleWithSource | undefined
  setStyle(property: Css, value: string | undefined, replace?: boolean): void
  createSetComponentCustomStyleCommand(
    property: Css,
    oldValue: string | undefined,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData>
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
    oldValue: string | undefined,
    newValue: string | undefined,
  ): ICommand<ISetComponentCustomStyleData> => {
    const { selectedComponent } = editor.value ?? {}
    if (!selectedComponent) {
      throw new Error(
        'Cannot create set component custom style command when no component is selected',
      )
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
    getStyleValue,
    getResolvedStyle,
    setStyle,
    createSetComponentCustomStyleCommand,
  }
}
