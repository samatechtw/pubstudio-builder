import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import {
  CustomDataAction,
  IAddRowApiRequest,
  ICustomDataApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'
import { IGetPublicSiteUsageApiResponse } from '@pubstudio/shared/type-api-site-sites'
import {
  ComponentArgPrimitive,
  Css,
  IBehaviorCustomArgs,
  IBehaviorHelpers,
  IComponent,
  IComponentEventBehavior,
  IComponentState,
  ISite,
} from '@pubstudio/shared/type-site'
import { rootSiteApi } from '@pubstudio/shared/util-web-site-api'
import { resolveComponent } from './resolve-component'

export interface IQueryOptions {
  clearCache: boolean
}

export const requireArgs = (
  args: IBehaviorCustomArgs | undefined,
  argNames: string[],
): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const name of argNames) {
    if (!args?.[name]) {
      return { error: `Arg "${name}" is required` }
    }
    result[name] = args[name] as string
  }
  return result
}

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

export const setInputIs = (
  component: IComponent | undefined,
  name: string,
  value: unknown,
) => {
  if (component?.inputs?.[name]) {
    component.inputs[name].is = value
  }
}

export const setCustomStyle = (
  component: IComponent | undefined,
  prop: Css,
  value: string,
) => {
  if (component?.style.custom[DEFAULT_BREAKPOINT_ID]?.default) {
    component.style.custom[DEFAULT_BREAKPOINT_ID].default[prop] = value
  } else if (component?.style.custom[DEFAULT_BREAKPOINT_ID]) {
    component.style.custom[DEFAULT_BREAKPOINT_ID].default = { [prop]: value }
  } else if (component?.style.custom) {
    component.style.custom[DEFAULT_BREAKPOINT_ID] = { default: { [prop]: value } }
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

export const setLoading = (component: IComponent | undefined, loading: boolean) => {
  const content = component?.children?.[0]
  const loader = component?.children?.[1]
  setState(loader, 'hide', !loading)
  setCustomStyle(content, Css.Opacity, loading ? '0' : '1')
}

const setError = (
  errorCmp: IComponent | undefined,
  error: unknown,
  errorMap?: Record<string, string>,
): string => {
  const e = error as Record<string, string>
  console.error(e)
  const errorMsg = errorMap?.[e.code] ?? e.message ?? 'Unknown error, try again later'
  setContent(errorCmp, errorMsg)
  setCustomStyle(errorCmp, Css.Opacity, '1')
  setCustomStyle(errorCmp, Css.Color, '${color-error}')
  return errorMsg
}

const addRow = async (table: string, row: Record<string, string>) => {
  const addRow: IAddRowApiRequest = {
    table_name: table,
    row,
  }
  const payload: ICustomDataApiRequest = {
    action: CustomDataAction.AddRow,
    data: addRow,
  }
  await rootSiteApi.authOptRequest({
    url: `api/sites/${rootSiteApi.siteId.value}/custom_data`,
    method: 'POST',
    data: payload,
  })
}

const getPublicUsage = async (site: ISite, options?: IQueryOptions) => {
  const { data } = await rootSiteApi.authOptRequest<IGetPublicSiteUsageApiResponse>({
    url: `api/sites/${rootSiteApi.siteId.value}/public_usage`,
  })
  return data
}

export const argArray = <T extends ComponentArgPrimitive>(arr: unknown): T[] => {
  const arrayStr = arr as string | undefined
  return (arrayStr ?? '').split(',') as T[]
}

export const behaviorHelpers: IBehaviorHelpers = {
  requireArgs,
  getComponent,
  setState,
  setContent,
  getValue,
  setInputIs,
  getEventBehavior,
  getCustomStyle,
  setCustomStyle,
  setLoading,
  setError,
  addRow,
  getPublicUsage,
}
