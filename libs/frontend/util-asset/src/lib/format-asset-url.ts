import { S3_SITE_ASSETS_URL } from '@pubstudio/frontend/util-config'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'

export const urlFromAsset = (asset: ISiteAssetViewModel): string => {
  let ext = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'application/pdf': 'pdf',
    'application/wasm': 'wasm',
    'text/javascript': 'js',
  }[asset.content_type]
  ext = ext ? `.${ext}` : ''

  return `${S3_SITE_ASSETS_URL}/${asset.site_id || asset.local_site_id}/${asset.id}${ext}`
}
