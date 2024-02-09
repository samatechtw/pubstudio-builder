import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IPage, ISite } from '@pubstudio/shared/type-site'
import { makeAddImageData } from './add-image-data'
import { makeAddLinkData } from './add-link-data'

export const addAssetData = (
  site: ISite,
  page: IPage,
  asset: ISiteAssetViewModel,
  url: string,
): IAddComponentData | undefined => {
  if (asset.content_type === AssetContentType.Pdf) {
    return makeAddLinkData(site, page.root, {
      src: url,
      openInNewTab: true,
      text: asset.name,
    })
  } else {
    return makeAddImageData(site, page.root, url)
  }
}
