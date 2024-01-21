import {
  captionedImageId,
  captionedImageStyleId,
  DEFAULT_BREAKPOINT_ID,
  imageId,
  imageStyleId,
  textId,
  textStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IRawStyle, IStyle, Tag } from '@pubstudio/shared/type-site'
import { defaultImageInputs } from '../default-inputs'

export const imageStyle: IStyle = {
  id: imageStyleId,
  name: 'ImageStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '100%',
        height: '100%',
        'object-fit': 'cover',
      },
    },
  },
}

const makeImage = (src: string, style?: IRawStyle): IComponent => {
  return {
    id: imageId,
    name: 'Image',
    tag: Tag.Img,
    inputs: defaultImageInputs(src),
    style: {
      custom: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: style ?? {},
        },
      },
      mixins: [imageStyle.id],
    },
  }
}

export const image = makeImage('')

export const captionedImageStyle: IStyle = {
  id: captionedImageStyleId,
  name: 'CaptionedImageStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'flex',
        'flex-direction': 'column',
        width: '100%',
        height: '100%',
        'object-fit': 'cover',
      },
    },
  },
}

export const captionedImage: IComponent = {
  id: captionedImageId,
  name: 'CaptionedImage',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          width: '400px',
        },
      },
    },
  },
  children: [
    makeImage('https://pubstudioassets.com/photo.png', {
      width: '100%',
      height: '400px',
    }),
    {
      id: textId,
      name: 'Text',
      tag: Tag.Div,
      content: 'Image caption',
      style: {
        custom: {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {
              margin: '6px 0px 0px 0px',
              opacity: '0.8',
            },
          },
        },
        mixins: [textStyleId],
      },
    },
  ],
}
