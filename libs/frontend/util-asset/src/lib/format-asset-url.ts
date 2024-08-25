import { S3_SITE_ASSETS_URL } from '@pubstudio/frontend/util-config'
import {
  extFromContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'

export const urlFromAsset = (asset: ISiteAssetViewModel): string => {
  let ext = extFromContentType(asset.content_type)
  ext = ext ? `.${ext}` : ''

  return `${S3_SITE_ASSETS_URL}/${asset.site_id || asset.local_site_id}/${asset.id}${ext}`
}
