import { AssetContentType } from '@pubstudio/shared/type-api-platform-site-asset'
import {
  ISerializedSiteContext,
  ISiteDefaults,
  ISitePages,
} from '@pubstudio/shared/type-site'

export interface IUpdatePlatformTemplateRequest {
  description?: string
  public?: boolean
  name?: string
  preview_content_size?: number
  preview_content_type?: AssetContentType
  version?: string
  context?: ISerializedSiteContext
  defaults?: ISiteDefaults
  pages?: ISitePages
}
