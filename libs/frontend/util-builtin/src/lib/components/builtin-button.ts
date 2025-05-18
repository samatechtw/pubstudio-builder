import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  buttonId,
  buttonStyleId,
  noBehaviorId,
  setupLoaderBehaviorId,
  tempChildId,
} from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  EditorEventName,
  IBreakpointStyles,
  IComponent,
  IComponentEvents,
  IComponentInputs,
  IStyle,
  Tag,
} from '@pubstudio/shared/type-site'
import { makeLoading } from './builtin-loading'

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
        position: 'relative',
      },
      ':hover': {
        'background-color': '${color-button-hover}',
      },
    },
  },
}

interface IMakeButtonOptions {
  name?: string
  content?: string
  style?: IBreakpointStyles
  events?: IComponentEvents
  inputs?: IComponentInputs
}

export const makeButton = (options?: IMakeButtonOptions): IComponent => {
  return {
    id: buttonId,
    name: options?.name ?? 'Button',
    tag: Tag.Button,
    content: options?.content ?? 'Click Me',
    style: {
      custom: { ...options?.style },
      mixins: [buttonStyle.id],
    },
    inputs: {
      type: {
        name: 'type',
        type: ComponentArgPrimitive.String,
        default: 'submit',
        attr: true,
        is: 'submit',
      },
      disabled: {
        name: 'disabled',
        type: ComponentArgPrimitive.Boolean,
        default: false,
        attr: true,
        is: false,
      },
      ...options?.inputs,
    },
    events: options?.events ?? {
      click: {
        name: 'click',
        behaviors: [{ behaviorId: noBehaviorId }],
      },
    },
    children: [
      {
        id: tempChildId,
        name: 'ButtonText',
        tag: Tag.Div,
        content: options?.content ?? 'Button',
        style: { custom: {}, mixins: [] },
      },
      makeLoading(),
    ],
  }
}

export const button = makeButton()
