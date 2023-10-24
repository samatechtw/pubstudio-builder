import {
  componentId,
  DEFAULT_BREAKPOINT_ID,
  verticalStyleId,
} from '@pubstudio/frontend/util-ids'
import { ISerializedComponent, ISite, Tag } from '@pubstudio/shared/type-site'

export const mockSerializedComponent = (
  site: ISite,
  props?: Partial<ISerializedComponent>,
): ISerializedComponent => {
  const nextId = site.context.nextId.toString()
  const component: ISerializedComponent = {
    id: componentId(site.context.namespace, nextId),
    name: `NewCmp-${nextId}`,
    tag: Tag.Div,
    role: undefined,
    parentId: 'test-c-1',
    children: undefined,
    content: undefined,
    events: undefined,
    style: {
      custom: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            width: '50%',
            height: '120px',
          },
        },
      },
      mixins: [verticalStyleId],
    },
    ...(props ?? {}),
  }
  return component
}
