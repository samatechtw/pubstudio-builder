import { link } from '@pubstudio/frontend/util-builtin'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { ComponentArgPrimitive, IComponent, ISite } from '@pubstudio/shared/type-site'
import { makeAddBuiltinComponentData } from './add-builtin-component-data'

export interface IMakeAddLinkDataProps {
  src?: string
  openInNewTab?: boolean
  text?: string
}

// Generate new link component data from an uploaded asset
export const makeAddLinkData = (
  site: ISite,
  parent: IComponent,
  props?: IMakeAddLinkDataProps,
): IAddComponentData | undefined => {
  const addData = makeAddBuiltinComponentData(
    link.id,
    parent,
    site.editor?.selectedComponent?.id,
  )
  if (!addData) {
    return undefined
  }
  if (addData.inputs?.['href'] && props?.src !== undefined) {
    addData.inputs.href.is = props?.src
  }
  if (addData.inputs && props?.openInNewTab) {
    addData.inputs.target = {
      type: ComponentArgPrimitive.String,
      attr: true,
      name: 'target',
      is: '_blank',
    }
  }
  if (props?.text) {
    addData.content = props?.text
  }
  return addData
}
