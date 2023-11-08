import { ICommand } from '@pubstudio/shared/type-command'
import { IEditorContext } from './i-editor-context'
import { IHead } from './i-head'
import { IPage } from './i-page'
import { ISiteContext } from './i-site-context'

export interface ISiteDefaults {
  head: IHead
  // Route of home page
  homePage: string
}

export type ISitePages = Record<string, IPage>

export interface ISite {
  context: ISiteContext
  name: string
  version: string
  defaults: ISiteDefaults
  editor?: IEditorContext
  history: {
    back: ICommand[]
    forward: ICommand[]
  }
  pages: Record<string, IPage>
  updated_at?: string
}
