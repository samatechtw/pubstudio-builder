import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  gridId,
  gridImageId,
  gridImageStyleId,
  imageGalleryId,
  imageGalleryStyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IRawStyle, IStyle, Tag } from '@pubstudio/shared/type-site'
import { makeImage } from './builtin-image'

export const gridImageStyle: IStyle = {
  id: gridImageStyleId,
  name: 'GridImageStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '100%',
        'object-fit': 'cover',
        'grid-column': 'span 1',
      },
    },
  },
}

export const imageGalleryStyle: IStyle = {
  id: imageGalleryStyleId,
  name: 'GridStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'grid',
        'grid-auto-rows': '220px',
        'grid-template-columns': 'repeat(3, 1fr)',
        'row-gap': '4px',
        'column-gap': '4px',
        width: '100%',
      },
    },
  },
}

const gridImage = (style?: IRawStyle): IComponent => ({
  id: gridImageId,
  name: 'ImageWrap',
  tag: Tag.Div,
  children: [makeImage('https://web.pubstudioassets.com/placeholder.png')],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: { ...style },
      },
    },
    mixins: [gridImageStyleId],
  },
})

export const imageGallery: IComponent = {
  id: imageGalleryId,
  name: 'ImageGallery',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: { width: '100%' },
      },
    },
  },
  children: [
    {
      id: gridId,
      name: 'Grid',
      tag: Tag.Div,
      style: {
        custom: {},
        mixins: [imageGalleryStyle.id],
      },
      children: [
        gridImage({ 'grid-column': 'span 2' }),
        gridImage(),
        gridImage(),
        gridImage(),
        gridImage(),
      ],
    },
  ],
}
