import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  dividerHorizontalId,
  dividerHorizontalStyleId,
  dividerVerticalId,
  dividerVerticalStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const dividerVerticalStyle: IStyle = {
  id: dividerVerticalStyleId,
  name: 'DividerVerticalStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '1px',
        height: '100%',
        margin: '0px 16px 0px 12px',
        'background-color': '${color-border}',
      },
    },
  },
}

export const dividerVertical: IComponent = {
  id: dividerVerticalId,
  name: 'DividerVertical',
  tag: Tag.Div,
  children: [],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {},
      },
    },
    mixins: [dividerVerticalStyle.id],
  },
}

export const dividerHorizontalStyle: IStyle = {
  id: dividerHorizontalStyleId,
  name: 'DividerHorizontalStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '100%',
        height: '1px',
        margin: '16px 0px 12px 0px',
        'background-color': '${color-border}',
      },
    },
  },
}

export const dividerHorizontal: IComponent = {
  id: dividerHorizontalId,
  name: 'DividerHorizontal',
  tag: Tag.Div,
  children: [],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {},
      },
    },
    mixins: [dividerHorizontalStyle.id],
  },
}
