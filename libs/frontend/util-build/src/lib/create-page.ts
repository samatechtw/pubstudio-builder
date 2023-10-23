import { IComponent, IPage, IPageMetadata } from '@pubstudio/shared/type-site'

export const createPage = (metadata: IPageMetadata, root: IComponent): IPage => ({
  ...metadata,
  root,
})
