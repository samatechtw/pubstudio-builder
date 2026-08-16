import { store } from '@pubstudio/frontend/data-access-web-store'
import { IUseSiteSource } from '@pubstudio/frontend/feature-site-store'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { ISite, SiteSaveState } from '@pubstudio/shared/type-site'
import { AgentError } from '../result'

export interface IIdentity {
  client: string
  model?: string
  skill?: string
}

interface ISessionState {
  siteSource: IUseSiteSource
  identity?: IIdentity
}

let state: ISessionState | undefined

export const startSession = (siteSource: IUseSiteSource) => {
  state = { siteSource }
}

export const endSession = () => {
  state = undefined
}

export const identify = (identity: IIdentity) => {
  requireSession().identity = identity
}

const requireSession = (): ISessionState => {
  if (!state) {
    throw new AgentError('NOT_READY', 'Agent tools are not installed on this page.')
  }
  return state
}

export const requireIdentified = () => {
  if (!requireSession().identity) {
    throw new AgentError(
      'NOT_IDENTIFIED',
      'Call PubStudio.identify({client, model, skill}) first.',
    )
  }
}

export const currentIdentity = (): IIdentity | undefined => state?.identity

export const siteSource = (): IUseSiteSource => requireSession().siteSource

export const isReady = (): boolean => !!state?.siteSource.site.value?.context

export const requireSite = (): ISite => {
  const site = requireSession().siteSource.site.value
  if (!site?.context) {
    throw new AgentError('NOT_READY', 'The builder has no site loaded yet.')
  }
  return site
}

export const editingEnabled = (): boolean => store.version.editingEnabled.value

export const requireEditable = () => {
  if (!editingEnabled()) {
    throw new AgentError(
      'READ_ONLY',
      'A site version or draft preview is active, so the live site cannot be edited.',
    )
  }
}

// Local sites write straight to localStorage, so saveState never leaves `Saved`
export const storageKind = (): 'api' | 'local' =>
  siteSource().isSiteApi.value ? 'api' : 'local'

export const saveState = (): SiteSaveState =>
  siteSource().siteStore.saveState as unknown as SiteSaveState

// Breakpoint an op falls back to when it does not name one
export const defaultBreakpointId = (): string => {
  const site = requireSite()
  return site.context.breakpoints[DEFAULT_BREAKPOINT_ID]
    ? DEFAULT_BREAKPOINT_ID
    : activeBreakpoint.value.id
}
