import { ITemplateViewModel } from './i-template.view-model'

export interface IUpdatePlatformTemplateResponse extends ITemplateViewModel {
  signed_preview_url?: string
}
