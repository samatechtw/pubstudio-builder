import { getLastCommand } from '@pubstudio/frontend/feature-command'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-build'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import { Css, IComponent, ISite, IStyleEntry } from '@pubstudio/shared/type-site'

export type IRemoveStyleEntry = Omit<IStyleEntry, 'value'>

export const setCustomStyleCommand = (
  component: IComponent,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry,
  replace = false,
): ICommand => {
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
    return {
      type: CommandType.SetComponentCustomStyle,
      data: {
        ...data,
        oldStyle: oldStyle ?? data.oldStyle,
      },
    }
  } else {
    return { type: CommandType.SetComponentCustomStyle, data }
  }
}

export const setComponentCustomStyleCommand = (
  site: ISite,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry,
  replace = false,
): ICommand | undefined => {
  const selected = site.editor?.selectedComponent
  if (selected) {
    return setCustomStyleCommand(selected, oldStyle, newStyle, replace)
  }
  return undefined
}

export const removeComponentCustomStyleCommand = (
  site: ISite,
  style: IRemoveStyleEntry,
): ICommand | undefined => {
  const selected = site.editor?.selectedComponent
  const oldValue =
    selected?.style.custom[activeBreakpoint.value.id]?.[style.pseudoClass]?.[
      style.property
    ]
  if (!selected || oldValue === undefined) {
    return undefined
  }
  const data: ISetComponentCustomStyleData = {
    componentId: selected.id,
    breakpointId: activeBreakpoint.value.id,
    oldStyle: {
      ...style,
      value: oldValue,
    },
  }
  return { type: CommandType.SetComponentCustomStyle, data }
}

// Commands for setting a component's position to absolute
// If the component's parent does not have position absolute or relative already,
// set it to relative.
export const setPositionAbsoluteCommands = (
  site: ISite,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry,
): ICommand[] => {
  const pseudoClass = newStyle.pseudoClass
  const selected = site.editor?.selectedComponent
  if (!selected) {
    return []
  }
  const parent = selected.parent
  const parentPosition = resolvedComponentStyle(
    site.context,
    parent,
    pseudoClass,
    Css.Position,
    activeBreakpoint.value.id,
  )
  // No action if parent already has relative position
  if (!parent || parentPosition === 'relative' || parentPosition === 'absolute') {
    const data: ISetComponentCustomStyleData = {
      componentId: selected.id,
      breakpointId: activeBreakpoint.value.id,
      oldStyle,
      newStyle,
    }
    return [{ type: CommandType.SetComponentCustomStyle, data }]
  } else {
    const oldValue =
      parent.style.custom[activeBreakpoint.value.id][pseudoClass]?.[Css.Position]
    return [
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
    ]
  }
}
