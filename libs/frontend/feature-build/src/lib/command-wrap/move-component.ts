import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { parseCssSize } from '@pubstudio/frontend/util-component'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  IComponentPosition,
  IMoveComponentData,
} from '@pubstudio/shared/type-command-data'
import { Css, CssPseudoClass, IComponent, ISite } from '@pubstudio/shared/type-site'

const makeSetComponentCustomStyle = (
  component: IComponent,
  breakpointId: string,
  prop: Css,
  oldValue: string | undefined,
  value: string,
): ICommand => {
  const pseudoClass = CssPseudoClass.Default
  return {
    type: CommandType.SetComponentCustomStyle,
    data: {
      componentId: component.id,
      breakpointId,
      oldStyle: oldValue ? { pseudoClass, property: prop, value: oldValue } : undefined,
      newStyle: { pseudoClass, property: prop, value },
    },
  }
}

const addPxToCss = (
  scale: number,
  value: string | undefined,
  fallbackValue: number,
  add: number,
): string => {
  const parsed = parseCssSize(value, 'px')
  const oldVal = parsed.unit !== 'px' ? fallbackValue : parseInt(parsed.value)
  return `${oldVal + (1 / scale) * add}px`
}

// Move an absolute position component by the specified amount
// Tries to convert units to pixels if they aren't already
export const moveAbsoluteComponent = (
  site: ISite,
  el: HTMLElement | null | undefined,
  component: IComponent,
  left: number,
  top: number,
) => {
  const breakpointId = activeBreakpoint.value.id
  const pseudoClass = CssPseudoClass.Default
  const oldLeft = component.style.custom[breakpointId]?.[pseudoClass]?.left
  const oldTop = component.style.custom[breakpointId]?.[pseudoClass]?.top
  const scale = site.editor?.builderScale ?? 1
  const fallbackOrigin = el?.getBoundingClientRect()
  const newLeft = addPxToCss(scale, oldLeft, fallbackOrigin?.left ?? 0, left)
  const newTop = addPxToCss(scale, oldTop, fallbackOrigin?.top ?? 0, top)

  const data: ICommandGroupData = {
    commands: [
      makeSetComponentCustomStyle(component, breakpointId, Css.Left, oldLeft, newLeft),
      makeSetComponentCustomStyle(component, breakpointId, Css.Top, oldTop, newTop),
    ],
  }
  pushCommand(site, CommandType.Group, data)
}

export const moveComponent = (
  site: ISite,
  from: IComponentPosition,
  to: IComponentPosition,
) => {
  const data: IMoveComponentData = {
    from,
    to,
    selectedComponentId: site.editor?.selectedComponent?.id,
  }
  pushCommand(site, CommandType.MoveComponent, data)
}
