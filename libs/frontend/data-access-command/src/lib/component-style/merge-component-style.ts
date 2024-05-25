import { mergeArr } from '@pubstudio/frontend/util-component'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IMergeComponentStyleData } from '@pubstudio/shared/type-command-data'
import { IPseudoStyle, ISite } from '@pubstudio/shared/type-site'
import { toRaw } from 'vue'
import { setSelectedComponent } from '../set-selected-component'

export interface MergeComponentStyle extends ICommand<IMergeComponentStyleData> {
  type: CommandType.MergeComponentStyle
}

export const applyMergeComponentStyle = (site: ISite, data: IMergeComponentStyleData) => {
  const { componentId, newStyle } = data
  const component = resolveComponent(site.context, componentId)
  if (component) {
    if (component.style.mixins || newStyle.mixins) {
      component.style.mixins = Array.from(
        new Set(mergeArr(component.style.mixins, newStyle.mixins)),
      )
    }
    for (const breakpointId in newStyle.custom) {
      component.style.custom[breakpointId] = mergePseudoStyle(
        toRaw(component.style.custom[breakpointId]) ?? {},
        newStyle.custom[breakpointId],
      )
    }
    // Select edited component for redo
    setSelectedComponent(site, component)
  }
}

export const undoMergeComponentStyle = (site: ISite, data: IMergeComponentStyleData) => {
  const { componentId, oldStyle } = data
  const component = resolveComponent(site.context, componentId)
  if (component) {
    component.style.mixins = oldStyle.mixins ? [...oldStyle.mixins] : undefined
    for (const breakpointId in component.style.custom) {
      component.style.custom[breakpointId] = mergePseudoStyle(
        {},
        oldStyle.custom[breakpointId],
      )
    }
    // Select edited component for undo
    setSelectedComponent(site, component)
  }
}

// Custom styles should be merged and de-duplicated with existing ones; new styles take precedence.
const mergePseudoStyle = (
  oldStyle: IPseudoStyle,
  newStyle: IPseudoStyle,
): IPseudoStyle => {
  const mergedStyle = structuredClone(oldStyle)
  for (const key in newStyle) {
    const castedKey = key as keyof IPseudoStyle
    mergedStyle[castedKey] = {
      ...mergedStyle[castedKey],
      ...newStyle[castedKey],
    }
  }
  return mergedStyle
}
