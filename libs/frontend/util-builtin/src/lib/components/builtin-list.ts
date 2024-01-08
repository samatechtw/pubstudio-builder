import {
  DEFAULT_BREAKPOINT_ID,
  liId,
  listItemStyleId,
  listStyleId,
  ollId,
  ulId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const listStyle: IStyle = {
  id: listStyleId,
  name: 'ListStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        margin: '0px',
        padding: '12px 16px 12px 32px',
        color: '${color-text}',
        'font-size': '${size-list}',
        'font-family': '${font-text}',
        'line-height': '170%',
      },
    },
  },
}

export const listItemStyle: IStyle = {
  id: listItemStyleId,
  name: 'ListItemStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        padding: '0 0 0 6px',
      },
    },
  },
}

export const makeListItem = (text: string): IComponent => {
  return {
    id: liId,
    name: 'List Item',
    tag: Tag.Li,
    content: text,
    style: {
      custom: {},
      mixins: [listItemStyleId],
    },
  }
}

export const ul: IComponent = {
  id: ulId,
  name: 'Bullet List',
  tag: Tag.Ul,
  children: [makeListItem('Item 1'), makeListItem('Item 2')],
  style: {
    custom: {},
    mixins: [listStyleId],
  },
}

export const ol: IComponent = {
  id: ollId,
  name: 'Number List',
  tag: Tag.Ol,
  children: [makeListItem('Item 1'), makeListItem('Item 2')],
  style: {
    custom: {},
    mixins: [listStyleId],
  },
}
