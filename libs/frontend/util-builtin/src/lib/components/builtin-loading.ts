import {
  DEFAULT_BREAKPOINT_ID,
  loadingDotStyleId,
  loadingId,
  loadingStyleId,
  tempChildId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IRawStyle, IStyle, Tag } from '@pubstudio/shared/type-site'

export const loadingDotStyle: IStyle = {
  id: loadingDotStyleId,
  name: 'LoadingDotStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '14px',
        height: '14px',
        'border-radius': '50%',
        'background-color': '#ffffff',
        animation: 'scale 0.6s ease alternate infinite',
      },
    },
  },
}

export const loadingStyle: IStyle = {
  id: loadingStyleId,
  name: 'LoadingStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '0px',
        left: '0px',
      },
    },
  },
}

const makeDot = (style: IRawStyle): IComponent => {
  return {
    id: tempChildId,
    name: 'Dot',
    tag: Tag.Span,
    style: {
      custom: { [DEFAULT_BREAKPOINT_ID]: { default: style } },
      mixins: [loadingDotStyleId],
    },
  }
}

export const makeLoading = (): IComponent => {
  return {
    id: loadingId,
    name: 'Loading',
    tag: Tag.Div,
    style: {
      custom: {},
      mixins: [loadingStyleId],
    },
    inputs: {},
    state: { hide: true },
    children: [
      makeDot({}),
      makeDot({ 'animation-delay': '0.2s', margin: '0px 0px 0px 4px' }),
      makeDot({ 'animation-delay': '0.4s', margin: '0px 0px 0px 4px' }),
    ],
  }
}
