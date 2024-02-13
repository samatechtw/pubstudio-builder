import { DEFAULT_BREAKPOINT_ID, linkId, linkStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'
import { defaultLinkInputs } from '../default-inputs'

export const linkStyle: IStyle = {
  id: linkStyleId,
  name: 'LinkStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'inline-block',
        color: '${color-link}',
        'font-size': '${size-text}',
        'font-family': '${font-text}',
      },
      ':visited': {
        color: '${color-link-visited}',
      },
    },
  },
}

export const link: IComponent = {
  id: linkId,
  name: 'Link',
  tag: Tag.A,
  content: undefined,
  style: {
    custom: {},
    mixins: [linkStyle.id],
  },
  inputs: defaultLinkInputs(),
}
