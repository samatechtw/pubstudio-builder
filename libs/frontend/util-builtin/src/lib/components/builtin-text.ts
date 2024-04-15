import { DEFAULT_BREAKPOINT_ID, textId, textStyleId } from '@pubstudio/frontend/util-ids'
import { IBreakpointStyles, IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

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

export const makeText = (
  name?: string,
  content?: string,
  style?: IBreakpointStyles,
): IComponent => {
  return {
    id: textId,
    name: name ?? 'Text',
    tag: Tag.Div,
    content: content ?? 'text content',
    style: {
      custom: style ?? {},
      mixins: [textStyle.id],
    },
  }
}

export const text = makeText()
