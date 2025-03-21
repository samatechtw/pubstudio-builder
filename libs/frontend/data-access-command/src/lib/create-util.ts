import { verticalStyle } from '@pubstudio/frontend/util-builtin'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { componentId, nextId } from '@pubstudio/frontend/util-ids'
import {
  IComponent,
  IPage,
  IPageMetadata,
  ISiteContext,
  Tag,
} from '@pubstudio/shared/type-site'

export const createRootComponent = (
  namespace: string,
  context: ISiteContext,
): IComponent => ({
  id: componentId(namespace, nextId(context)),
  name: 'Root',
  tag: Tag.Div,
  children: undefined,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          width: '100%',
          height: '100%',
          'background-color': 'white',
        },
      },
    },
    mixins: [verticalStyle.id],
  },
})

export const createPage = (metadata: IPageMetadata, root: IComponent): IPage => ({
  ...metadata,
  root,
})
