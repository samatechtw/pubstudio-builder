import {
  DEFAULT_BREAKPOINT_ID,
  footerId,
  footerStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const footerStyle: IStyle = {
  id: footerStyleId,
  name: 'FooterStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'min-height': '40px',
        width: '100%',
      },
    },
  },
}

export const footer: IComponent = {
  id: footerId,
  name: 'Footer',
  tag: Tag.Footer,
  content: 'footer',
  style: {
    custom: {},
    mixins: [footerStyle.id],
  },
}
