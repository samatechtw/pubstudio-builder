import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetComponentOverrideStyleData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite, IStyleEntry } from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

export interface SetComponentOverrideStyle extends ICommand<ISetComponentOverrideStyleData> {
  type: CommandType.SetComponentOverrideStyle
}

const deleteOverrideStyle = (
  component: IComponent,
  selector: string,
  breakpointId: string,
  style: IStyleEntry,
) => {
  const overrides = component.style.overrides
  const selectorStyles = overrides?.[selector]
  const breakpointStyles = selectorStyles?.[breakpointId]
  const pseudoClassStyles = breakpointStyles?.[style.pseudoClass]
  if (!overrides || !selectorStyles || !breakpointStyles || !pseudoClassStyles) {
    return
  }

  delete pseudoClassStyles[style.property]
  if (Object.keys(pseudoClassStyles).length === 0) {
    delete breakpointStyles[style.pseudoClass]
  }
  if (Object.keys(breakpointStyles).length === 0) {
    delete selectorStyles[breakpointId]
  }
  if (Object.keys(selectorStyles).length === 0) {
    delete overrides[selector]
  }
  if (Object.keys(overrides).length === 0) {
    delete component.style.overrides
  }
}

const setOverrideStyle = (
  component: IComponent | undefined,
  selector: string,
  breakpointId: string,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry | undefined,
) => {
  if (!oldStyle && !newStyle) {
    throw new Error('oldStyle or newStyle must be defined')
  }
  if (component) {
    // Delete old style
    if (oldStyle) {
      deleteOverrideStyle(component, selector, breakpointId, oldStyle)
    }
    // Add new style
    if (newStyle) {
      const pseudoClass =
        component.style.overrides?.[selector]?.[breakpointId]?.[newStyle.pseudoClass]
      if (pseudoClass) {
        pseudoClass[newStyle.property] = newStyle.value
      } else {
        const overrides = component.style.overrides ?? {}
        if (!overrides[selector]) {
          overrides[selector] = {}
        }
        if (!overrides[selector][breakpointId]) {
          overrides[selector][breakpointId] = {}
        }
        overrides[selector][breakpointId][newStyle.pseudoClass] = {
          [newStyle.property]: newStyle.value,
        }
        component.style.overrides = overrides
      }
    }
  }
}

export const applySetComponentOverrideStyle = (
  site: ISite,
  data: ISetComponentOverrideStyleData,
) => {
  const { componentId, selector, oldStyle, newStyle } = data
  const component = resolveComponent(site.context, componentId)
  setOverrideStyle(component, selector, data.breakpointId, oldStyle, newStyle)
  // Select edited component for redo
  setSelectedComponent(site, component)
}

export const undoSetComponentOverrideStyle = (
  site: ISite,
  data: ISetComponentOverrideStyleData,
) => {
  const { componentId, selector, oldStyle, newStyle } = data
  const component = resolveComponent(site.context, componentId)
  setOverrideStyle(component, selector, data.breakpointId, newStyle, oldStyle)
  // Select edited component for undo
  setSelectedComponent(site, component)
}
