import { AssetContentType } from '@pubstudio/shared/type-api-platform-site-asset'
import {
  ISerializedSiteContext,
  ISiteDefaults,
  ISitePages,
} from '@pubstudio/shared/type-site'

export interface ICreatePlatformTemplateRequest {
  collection_id: string
  description: string
  preview_content_size: number
  preview_content_type: AssetContentType
  public: boolean
  name: string
  version: string
  context: ISerializedSiteContext
  defaults: ISiteDefaults
  pages: ISitePages
}
