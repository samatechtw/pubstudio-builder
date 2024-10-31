import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { inputId, inputStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'
import { defaultInputInputs } from '../default-inputs'

export const inputStyle: IStyle = {
  id: inputStyleId,
  name: 'InputStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        margin: '0px',
        color: '${color-text}',
        'font-size': '15px',
        'font-family': '${font-text}',
        width: '160px',
        height: '40px',
        'border-radius': '2px',
        border: '1px solid #5d99b6',
        outline: 'none',
        'outline-style': 'none',
        'box-shadow': 'none',
        padding: '8px 10px',
        transition: 'border-color 0.2s, background-color 0.2s',
        'background-color': 'rgba(255, 255, 255, 0.1)',
      },
      ':focus': {
        'border-color': '#fff',
        'background-color': 'rgba(255, 255, 255, 0.3)',
      },
      '::placeholder': {
        color: 'black',
        opacity: '0.5',
      },
    },
  },
}

export const input: IComponent = {
  id: inputId,
  name: 'Input',
  tag: Tag.Input,
  inputs: defaultInputInputs(),
  style: {
    custom: {},
    mixins: [inputStyle.id],
  },
}
