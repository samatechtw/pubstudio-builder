import { IApiError } from '@pubstudio/shared/type-api'
import { IEditorContext } from './i-editor-context'
import { ISite } from './i-site'

import type { ComputedRef, Ref } from 'vue'
export interface ISiteRestore {
  site: ISite
  error: string | undefined
}

export enum SiteSaveState {
  SavingEditor = 'savingEditor',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
}

export interface ISiteStore {
  saveState: Ref<SiteSaveState> | ComputedRef<SiteSaveState>
  siteId: Ref<string>
  saveError: Ref<IApiError | undefined>
  initialize(): Promise<void>
  save(site: ISite, immediate?: boolean): Promise<void>
  saveEditor(editor: IEditorContext): Promise<void>
  restore(updateKey?: string): Promise<ISiteRestore | undefined>
}