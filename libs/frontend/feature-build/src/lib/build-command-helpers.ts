import { getLastCommand } from '@pubstudio/frontend/data-access-command'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-component'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IEditStyleMixinData,
  ISetComponentCustomStyleData,
  ISetComponentOverrideStyleData,
  ISetMixinEntryData,
} from '@pubstudio/shared/type-command-data'
import { Css, IComponent, ISite, IStyleEntry } from '@pubstudio/shared/type-site'

export type IRemoveStyleEntry = Omit<IStyleEntry, 'value'>

export interface ISetCustomStyleOptions {
  replace?: boolean
  select?: boolean
}

export const setCustomStyleCommand = (
  site: ISite,
  component: IComponent,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry,
  options?: ISetCustomStyleOptions,
): ICommand => {
  const data: ISetComponentCustomStyleData = {
    componentId: component.id,
    breakpointId: activeBreakpoint.value.id,
    oldStyle,
    newStyle,
    select: options?.select,
  }
  if (options?.replace) {
    // Keep the original "old" data in a chain of commands
    const lastCommand = getLastCommand(site)
    const oldStyle = (lastCommand?.data as ISetComponentCustomStyleData | undefined)
      ?.oldStyle
    return {
      type: CommandType.SetComponentCustomStyle,
      data: {
        ...data,
        oldStyle,
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
  options?: ISetCustomStyleOptions,
): ICommand | undefined => {
  const selected = site.editor?.selectedComponent
  if (selected) {
    return setCustomStyleCommand(site, selected, oldStyle, newStyle, options)
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
  // Clear empty/invalid position
  const old = oldStyle?.value ? oldStyle : undefined
  const data: ISetComponentCustomStyleData = {
    componentId: selected.id,
    breakpointId: activeBreakpoint.value.id,
    oldStyle: old,
    newStyle,
  }
  const setAbsolute = { type: CommandType.SetComponentCustomStyle, data }
  // No action if parent already has relative position
  if (!parent || parentPosition === 'relative' || parentPosition === 'absolute') {
    return [setAbsolute]
  } else {
    const oldValue =
      parent.style.custom[activeBreakpoint.value.id][pseudoClass]?.[Css.Position]
    const parentData: ISetComponentCustomStyleData = {
      componentId: parent.id,
      breakpointId: activeBreakpoint.value.id,
      select: false,
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
    }
    return [
      {
        type: CommandType.SetComponentCustomStyle,
        data: parentData,
      },
      setAbsolute,
    ]
  }
}
export const setOverrideStyleCommand = (
  site: ISite,
  selector: string,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry,
): ICommand | undefined => {
  const selected = site.editor?.selectedComponent
  if (!selected) {
    return undefined
  }
  const data: ISetComponentOverrideStyleData = {
    componentId: selected.id,
    selector,
    breakpointId: activeBreakpoint.value.id,
    oldStyle,
    newStyle,
  }
  return { type: CommandType.SetComponentOverrideStyle, data }
}

export const removeComponentOverrideStyleEntryCommand = (
  site: ISite,
  selector: string,
  style: IRemoveStyleEntry,
): ICommand | undefined => {
  const selected = site.editor?.selectedComponent
  const oldValue =
    selected?.style.overrides?.[selector][activeBreakpoint.value.id][style.pseudoClass]?.[
      style.property
    ]
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
  return { type: CommandType.SetComponentOverrideStyle, data }
}

export const editMixinEntryCommand = (
  mixinId: string,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry | undefined,
): ICommand => {
  const data: ISetMixinEntryData = {
    mixinId,
    breakpointId: activeBreakpoint.value.id,
    oldStyle,
    newStyle,
  }
  return { type: CommandType.SetMixinEntry, data }
}

export const editStyleNameCommand = (
  mixinId: string,
  oldName: string,
  newName: string,
): ICommand | undefined => {
  const data: IEditStyleMixinData = {
    id: mixinId,
    oldName,
    newName,
  }
  return { type: CommandType.EditStyleMixin, data }
}
