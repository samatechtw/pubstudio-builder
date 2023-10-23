import { verticalStyle } from '@pubstudio/frontend/util-builtin'
import { componentId, DEFAULT_BREAKPOINT_ID, nextId } from '@pubstudio/frontend/util-ids'
import { IComponent, ISiteContext, Tag } from '@pubstudio/shared/type-site'

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
        },
      },
    },
    mixins: [verticalStyle.id],
  },
})
