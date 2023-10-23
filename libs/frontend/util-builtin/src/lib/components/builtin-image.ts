import {
  DEFAULT_BREAKPOINT_ID,
  imageId,
  imageStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'
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

export const image: IComponent = {
  id: imageId,
  name: 'Image',
  tag: Tag.Img,
  inputs: defaultImageInputs(''),
  style: {
    custom: {},
    mixins: [imageStyle.id],
  },
}
