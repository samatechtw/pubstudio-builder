import {
  containerHorizontalId,
  DEFAULT_BREAKPOINT_ID,
  horizontalStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const horizontalStyle: IStyle = {
  id: horizontalStyleId,
  name: 'ContainerHorizontalStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'flex',
        'flex-direction': 'row',
        'align-items': 'flex-start',
        width: '100%',
      },
    },
  },
}

export const containerHorizontal: IComponent = {
  id: containerHorizontalId,
  name: 'ContainerHorizontal',
  tag: Tag.Div,
  children: [],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          height: '120px',
        },
      },
    },
    mixins: [horizontalStyle.id],
  },
}
