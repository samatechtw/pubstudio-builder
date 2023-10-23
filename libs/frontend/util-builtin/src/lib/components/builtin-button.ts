import {
  buttonId,
  buttonStyleId,
  DEFAULT_BREAKPOINT_ID,
  noBehaviorId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const buttonStyle: IStyle = {
  id: buttonStyleId,
  name: 'ButtonStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'inline-block',
        color: '${color-text}',
        'background-color': '${color-primary}',
        'font-family': '${font-title}',
        'font-size': '${size-text}',
        'text-align': 'center',
        padding: '12px 24px 11px',
        'border-radius': '8px',
        cursor: 'pointer',
        border: 'none',
      },
      ':hover': {
        'background-color': '${color-button-hover}',
      },
    },
  },
}

export const button: IComponent = {
  id: buttonId,
  name: 'Button',
  tag: Tag.Button,
  content: 'Click Me',
  style: {
    custom: {},
    mixins: [buttonStyle.id],
  },
  events: {
    click: {
      name: 'click',
      behaviors: [
        {
          behaviorId: noBehaviorId,
        },
      ],
    },
  },
}
