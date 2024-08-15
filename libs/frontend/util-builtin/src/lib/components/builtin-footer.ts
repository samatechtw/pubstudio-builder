import {
  DEFAULT_BREAKPOINT_ID,
  footerId,
  footerStyleId,
  tempChildId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const footerStyle: IStyle = {
  id: footerStyleId,
  name: 'FooterStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        padding: '40px 0px 12px 0px',
        width: '100%',
        color: '${color-text}',
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'center',
        'font-size': '14px',
        margin: 'auto 0px 0px 0px',
      },
    },
  },
}

export const footer: IComponent = {
  id: footerId,
  name: 'Footer',
  tag: Tag.Footer,
  style: {
    custom: {},
    mixins: [footerStyle.id],
  },
  children: [
    {
      id: tempChildId,
      name: 'Copyright',
      tag: Tag.Div,
      content: '© 2024 MyCompany',
      style: { custom: {}, mixins: [] },
    },
  ],
}
