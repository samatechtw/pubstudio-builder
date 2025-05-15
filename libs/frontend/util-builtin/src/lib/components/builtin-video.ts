import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  videoId,
  videoSourceId,
  videoStyleId,
  videoWrapId,
  videoWrapStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'
import { defaultSourceInputs, defaultVideoInputs } from '../default-inputs'

export const videoWrapStyle: IStyle = {
  id: videoWrapStyleId,
  name: 'VideoWrapStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '640px',
        height: '480px',
        display: 'flex',
      },
    },
  },
}

export const videoStyle: IStyle = {
  id: videoStyleId,
  name: 'VideoStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '100%',
        height: '100%',
      },
    },
  },
}

export const video: IComponent = {
  id: videoWrapId,
  name: 'VideoWrap',
  tag: Tag.Div,
  style: { custom: {}, mixins: [videoWrapStyle.id] },
  children: [
    {
      id: videoId,
      name: 'Video',
      tag: Tag.Video,
      inputs: defaultVideoInputs(),
      style: {
        custom: {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {},
          },
        },
        mixins: [videoStyle.id],
      },
      children: [
        {
          id: videoSourceId,
          name: 'VideoSource',
          tag: Tag.Source,
          inputs: defaultSourceInputs(),
          style: { custom: {} },
        },
      ],
    },
  ],
}
