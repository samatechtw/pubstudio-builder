import { ITemplateViewModel } from './i-template.view-model'

export interface ICreatePlatformTemplateResponse extends ITemplateViewModel {
  signed_preview_url: string
}
