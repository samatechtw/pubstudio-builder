import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite, IStyleEntry } from '@pubstudio/shared/type-site'

export interface SetComponentCustomStyle extends ICommand<ISetComponentCustomStyleData> {
  type: CommandType.SetComponentCustomStyle
}

const setStyle = (
  component: IComponent | undefined,
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
      delete component.style.custom[breakpointId]?.[oldStyle.pseudoClass]?.[
        oldStyle.property
      ]
    }
    // Add new style
    if (newStyle) {
      const pseudoClass = component.style.custom[breakpointId]?.[newStyle.pseudoClass]
      if (pseudoClass) {
        pseudoClass[newStyle.property] = newStyle.value
      } else {
        if (!component.style.custom[breakpointId]) {
          component.style.custom[breakpointId] = {}
        }
        component.style.custom[breakpointId][newStyle.pseudoClass] = {
          [newStyle.property]: newStyle.value,
        }
      }
    }
  }
}

export const applySetComponentCustomStyle = (
  site: ISite,
  data: ISetComponentCustomStyleData,
) => {
  const { componentId, oldStyle, newStyle } = data
  const component = resolveComponent(site.context, componentId)
  setStyle(component, data.breakpointId, oldStyle, newStyle)
}

export const undoSetComponentCustomStyle = (
  site: ISite,
  data: ISetComponentCustomStyleData,
) => {
  const { componentId, oldStyle, newStyle } = data
  const component = resolveComponent(site.context, componentId)
  setStyle(component, data.breakpointId, newStyle, oldStyle)
}
