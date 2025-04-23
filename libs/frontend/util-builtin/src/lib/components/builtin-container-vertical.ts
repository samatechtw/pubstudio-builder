import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { containerVerticalId, verticalStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const verticalStyle: IStyle = {
  id: verticalStyleId,
  name: 'ContainerVerticalStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'flex',
        'flex-direction': 'column',
      },
    },
  },
}

export const containerVertical: IComponent = {
  id: containerVerticalId,
  name: 'ContainerVertical',
  tag: Tag.Div,
  children: [],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          width: '50%',
          'min-height': '120px',
        },
      },
    },
    mixins: [verticalStyle.id],
  },
}
