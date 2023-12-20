import { image } from '@pubstudio/frontend/util-builtin'
import { S3_SITE_ASSETS_URL } from '@pubstudio/frontend/util-config'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { contentTypeExt } from '@pubstudio/shared/util-format'
import { makeAddBuiltinComponentData } from './add-builtin-component-data'

// Generate new image component data from a newly uploaded asset
export const makeAddImageData = (
  site: ISite,
  parent: IComponent,
  asset: ISiteAssetViewModel,
): IAddComponentData | undefined => {
  const addData = makeAddBuiltinComponentData(
    site,
    image.id,
    parent,
    site.editor?.selectedComponent?.id,
  )
  if (!addData) {
    return undefined
  }
  const { content_type, site_id, id } = asset
  if (addData.inputs?.['src']) {
    addData.inputs.src.is = `${S3_SITE_ASSETS_URL}/${
      site_id || 'identity'
    }/${id}.${contentTypeExt(content_type as AssetContentType)}`
  }
  return addData
}
