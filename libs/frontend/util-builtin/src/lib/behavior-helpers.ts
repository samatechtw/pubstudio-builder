import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  Css,
  IBehaviorHelpers,
  IComponent,
  IComponentEventBehavior,
  IComponentState,
  ISite,
} from '@pubstudio/shared/type-site'
import { resolveComponent } from './resolve-component'

export const getComponent = (
  site: ISite,
  componentId: string,
): IComponent | undefined => {
  return resolveComponent(site.context, componentId)
}

export const setState = (
  component: IComponent | undefined,
  field: string,
  value: IComponentState,
) => {
  if (component) {
    if (component.state) {
      component.state[field] = value
    } else {
      component.state = { [field]: value }
    }
  }
}

export const setContent = (
  component: IComponent | undefined,
  content: string | undefined,
): void => {
  if (component) {
    component.content = content
  }
}

export const getValue = (componentId: string): string | undefined => {
  const el = document.getElementById(componentId) as HTMLInputElement | undefined
  return el?.value
}

export const setInputIs = (component: IComponent, name: string, value: unknown) => {
  if (component.inputs?.[name]) {
    component.inputs[name].is = value
  }
}

export const setCustomStyle = (
  component: IComponent | undefined,
  prop: Css,
  value: string,
) => {
  if (component?.style.custom[DEFAULT_BREAKPOINT_ID].default) {
    component.style.custom[DEFAULT_BREAKPOINT_ID].default[prop] = value
  }
}

export const getCustomStyle = (
  component: IComponent | undefined,
  prop: Css,
): string | undefined => {
  return component?.style.custom?.[DEFAULT_BREAKPOINT_ID].default?.[prop]
}

export const getEventBehavior = (
  component: IComponent,
  behaviorId: string,
): IComponentEventBehavior[] => {
  const behaviors: IComponentEventBehavior[] = []
  const events = Object.values(component.events ?? {})
  for (const event of events) {
    for (const behavior of event.behaviors) {
      if (behavior.behaviorId === behaviorId) {
        behaviors.push(behavior)
      }
    }
  }
  return behaviors
}

export const argArray = <T extends ComponentArgPrimitive>(arr: unknown): T[] => {
  const arrayStr = arr as string | undefined
  return (arrayStr ?? '').split(',') as T[]
}

export const behaviorHelpers: IBehaviorHelpers = {
  getComponent,
  setState,
  setContent,
  getValue,
  setInputIs,
  getEventBehavior,
  getCustomStyle,
  setCustomStyle,
}
