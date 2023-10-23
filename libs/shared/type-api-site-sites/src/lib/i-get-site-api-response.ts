import { ISiteViewModel } from './i-site.view-model'

export interface IGetSiteApiResponse extends Omit<ISiteViewModel, 'editor' | 'history'> {
  editor?: string
  history?: string
}
