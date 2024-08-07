import {
  DEFAULT_BREAKPOINT_ID,
  labelId,
  labelStyleId,
} from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  IComponent,
  IStyle,
  Tag,
} from '@pubstudio/shared/type-site'

export const labelStyle: IStyle = {
  id: labelStyleId,
  name: 'LabelStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '15px',
        'font-family': '${font-text}',
      },
    },
  },
}

export const label: IComponent = {
  id: labelId,
  name: 'Label',
  tag: Tag.Label,
  content: 'Label',
  inputs: {
    placeholder: {
      type: ComponentArgPrimitive.String,
      name: 'for',
      attr: true,
      default: '',
      is: '',
    },
  },
  style: {
    custom: {},
    mixins: [labelStyle.id],
  },
}
