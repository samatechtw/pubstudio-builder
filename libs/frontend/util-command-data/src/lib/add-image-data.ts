import { image } from '@pubstudio/frontend/util-builtin'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { makeAddBuiltinComponentData } from './add-builtin-component-data'

// Generate new image component data from a newly uploaded asset
export const makeAddImageData = (
  site: ISite,
  parent: IComponent,
  assetUrl: string,
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
  if (addData.inputs?.['src']) {
    addData.inputs.src.is = assetUrl
  }
  return addData
}
