import { ApiResponse, IApiError } from '@pubstudio/shared/type-api'
import { FetchApi, FetchRequestConfig } from '@sampullman/fetch-api'
import { IEditorContext } from './i-editor-context'
import { ISite } from './i-site'

import type { ComputedRef, Ref } from 'vue'
export interface ISiteRestore {
  site: ISite
  error: string | undefined
}

export interface ISiteSaveOptions {
  immediate?: boolean
  ignoreUpdateKey?: boolean
  forceUpdate?: boolean
}

// Types to mimic site API in `apps/web-site/src/app/api.ts`
export type ISiteApi = FetchApi<ApiResponse> & {
  authRequest<T>(config: FetchRequestConfig): Promise<ApiResponse<T>>
  authOptRequest<T>(config: FetchRequestConfig): Promise<ApiResponse<T>>
}

export interface IInitializeApiStore {
  siteApi: ISiteApi
  serverAddress: string
}

export enum SiteSaveState {
  SavingEditor = 'savingEditor',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
}

export interface ISiteStoreInitializeResult {
  serverAddress: string
  siteVersion: string
}

export interface ISiteStore {
  saveState: Ref<SiteSaveState> | ComputedRef<SiteSaveState>
  siteId: Ref<string>
  saveError: IApiError | undefined
  initialize(): Promise<ISiteStoreInitializeResult | undefined>
  save(site: ISite, options?: ISiteSaveOptions): Promise<void>
  saveEditor(editor: IEditorContext): Promise<void>
  restore(updateKey?: number): Promise<ISiteRestore | undefined>
  setUpdateKey(key: string | undefined): void
}
