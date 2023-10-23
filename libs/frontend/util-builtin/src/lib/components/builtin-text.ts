import { DEFAULT_BREAKPOINT_ID, textId, textStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const textStyle: IStyle = {
  id: textStyleId,
  name: 'TextStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        margin: '0px',
        color: '${color-text}',
        'font-size': '${size-text}',
        'font-family': '${font-text}',
      },
    },
  },
}

export const text: IComponent = {
  id: textId,
  name: 'Text',
  tag: Tag.Paragraph,
  content: 'text content',
  style: {
    custom: {},
    mixins: [textStyle.id],
  },
}
