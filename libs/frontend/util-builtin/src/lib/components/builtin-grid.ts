import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { gridId, gridStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const gridStyle: IStyle = {
  id: gridStyleId,
  name: 'GridStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'grid',
        'grid-template-rows': 'auto',
        'grid-template-columns': 'repeat(3, 1fr)',
        'row-gap': '4px',
        'column-gap': '4px',
        width: '100%',
      },
    },
  },
}

export const grid: IComponent = {
  id: gridId,
  name: 'Grid',
  tag: Tag.Div,
  children: [],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          'min-height': '120px',
        },
      },
    },
    mixins: [gridStyle.id],
  },
}
