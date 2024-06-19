import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { styleId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentMixinData,
  IAddStyleMixinData,
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import {
  Css,
  CssPseudoClass,
  IBreakpointStyles,
  ISite,
} from '@pubstudio/shared/type-site'

export const addMixin = (site: ISite, name: string, breakpoints: IBreakpointStyles) => {
  const data: IAddStyleMixinData = {
    name: name,
    breakpoints: breakpoints,
  }
  pushCommand(site, CommandType.AddStyleMixin, data)
}

export const convertComponentStyle = (
  site: ISite,
  componentId: string,
  name: string,
  breakpoints: IBreakpointStyles,
): string | undefined => {
  const component = resolveComponent(site.context, componentId)
  if (component) {
    // Create the new mixin
    const styleData: IAddStyleMixinData = {
      name,
      breakpoints,
    }
    // Add the new mixin to the component
    const { nextId, namespace } = site.context
    const mixinId = styleId(namespace, nextId.toString())
    const addToComponent: IAddComponentMixinData = {
      componentId,
      // Precalculate the expected mixin ID
      mixinId,
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
          const pseudos = breakpoints[bpId]?.[pseudoClass]
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
    pushCommand(site, CommandType.Group, data)
    return mixinId
  }
}
