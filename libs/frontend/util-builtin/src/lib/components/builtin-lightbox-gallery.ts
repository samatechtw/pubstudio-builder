import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  gridId,
  gridImageStyleId,
  horizontalStyleId,
  imageId,
  imageNavStyleId,
  lightboxContentStyleId,
  lightboxGalleryId,
  lightboxGalleryStyleId,
  lightboxIconWrapStyleId,
  lightboxWrapStyleId,
  showLightboxBehaviorId,
  stopClickBehaviorId,
  tempChildId,
  verticalStyleId,
} from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  ComponentEventType,
  IComponent,
  IRawStyle,
  IStyle,
  Tag,
} from '@pubstudio/shared/type-site'
import { imageStyle, makeImage } from './builtin-image'
import { makeLoading } from './builtin-loading'

const stopClickEvents = {
  [ComponentEventType.Click]: {
    name: ComponentEventType.Click,
    behaviors: [{ behaviorId: stopClickBehaviorId }],
  },
}

export const lightboxGalleryStyle: IStyle = {
  id: lightboxGalleryStyleId,
  name: 'LightboxGalleryStyle',
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

export const imageNavStyle: IStyle = {
  id: imageNavStyleId,
  name: 'ImageNavStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '40px',
        height: '40px',
        'border-radius': '50%',
        'background-color': '#131314',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        flex: '0 0 auto',
      },
      ':hover': {
        'background-color': '#393b3a',
      },
    },
  },
}

export const lightboxWrapStyle: IStyle = {
  id: lightboxWrapStyleId,
  name: 'LightboxWrapStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        position: 'fixed',
        width: '100%',
        height: '100%',
        'background-color': 'rgba(31, 31, 31, 0.92)',
        top: '0',
        left: '0',
      },
    },
  },
}

export const lightboxContentStyle: IStyle = {
  id: lightboxContentStyleId,
  name: 'LightboxContentStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        display: 'flex',
        position: 'fixed',
        width: '100%',
        'max-width': 'calc(100% - 44px)',
        height: '100%',
      },
    },
  },
}

export const lightboxIconWrapStyle: IStyle = {
  id: lightboxIconWrapStyleId,
  name: 'LightboxIconWrapStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '40px',
        height: '40px',
        'border-radius': '50%',
        margin: '0 0 0 auto',
        cursor: 'pointer',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        transition: 'background-color 0.2s ease',
        'background-color': 'rgba(100, 100, 100, 0.1)',
      },
      ':hover': {
        'background-color': '#393b3a',
      },
    },
  },
}

const gridImage = (style?: IRawStyle): IComponent => ({
  id: tempChildId,
  name: 'ImageWrap',
  tag: Tag.Div,
  children: [makeImage('https://web.pubstudioassets.com/placeholder.png')],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: { ...style, cursor: 'pointer' },
      },
    },
    mixins: [gridImageStyleId],
  },
})

const caret =
  '<svg height="32" viewBox="0 0 28 28" width="32" xmlns="http://www.w3.org/2000/svg"><path d="m16.64 16.08-4.94-4.58 4.94-4.6-1.52-1.4-6.48 6 6.48 6z" fill="#fff" transform="translate(0.5 2.3)"/></svg>'
const x =
  '<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><line x1="1" y1="11" x2="11" y2="1" stroke-width="1.4" stroke-linecap="round" /><line x1="1" y1="1" x2="11" y2="11" stroke-width="1.4" stroke-linecap="round" /></svg>'
const download =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path d="M20 15a1 1 0 0 1 1 1v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a1 1 0 1 1 2 0v4h14v-4a1 1 0 0 1 1-1M12 2a1 1 0 0 1 1 1v10.243l2.536-2.536a1 1 0 1 1 1.414 1.414l-4.066 4.066a1.25 1.25 0 0 1-1.768 0L7.05 12.121a1 1 0 1 1 1.414-1.414L11 13.243V3a1 1 0 0 1 1-1"/></svg>'

const makeSvg = (name: string, content: string, size: number) => {
  return {
    id: tempChildId,
    name,
    tag: Tag.Svg,
    content,
    style: {
      custom: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            width: `${size}px`,
            height: `${size}px`,
            stroke: 'white',
            fill: 'white',
          },
        },
      },
    },
  }
}

const xWrap: IComponent = {
  id: tempChildId,
  name: 'IconWrap',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: { margin: '0 0 0 16px' },
      },
    },
    mixins: [lightboxIconWrapStyleId],
  },
  children: [makeSvg('XIcon', x, 16)],
}

const downloadWrap: IComponent = {
  id: tempChildId,
  name: 'IconWrap',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {},
      },
    },
    mixins: [lightboxIconWrapStyleId],
  },
  inputs: {
    imageId: {
      type: ComponentArgPrimitive.String,
      name: 'imageId',
      attr: true,
      default: '',
      is: '',
    },
  },
  children: [makeSvg('DownloadIcon', download, 24)],
}

export const imageLightbox: IComponent = {
  id: tempChildId,
  name: 'ImageLightbox',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {},
      },
    },
    mixins: [lightboxWrapStyleId],
  },
  state: {
    hide: true,
  },
  children: [
    {
      id: tempChildId,
      name: 'LightboxContent',
      tag: Tag.Div,
      style: {
        custom: {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {},
          },
        },
        mixins: [lightboxContentStyleId, verticalStyleId],
      },
      children: [
        {
          id: tempChildId,
          name: 'LightboxTop',
          tag: Tag.Div,
          style: {
            custom: {
              [DEFAULT_BREAKPOINT_ID]: {
                default: { width: '80%', margin: '0 auto', padding: '8px 0' },
              },
            },
            mixins: [horizontalStyleId],
          },
          children: [downloadWrap, xWrap],
        },
        {
          id: tempChildId,
          name: 'LightboxImage',
          tag: Tag.Div,
          style: {
            custom: {
              [DEFAULT_BREAKPOINT_ID]: {
                default: {
                  height: 'calc(100% - 96px)',
                  'align-items': 'center',
                  'justify-content': 'center',
                  position: 'relative',
                },
              },
            },
            mixins: [horizontalStyleId],
          },
          children: [
            {
              id: tempChildId,
              name: 'ImageLeft',
              tag: Tag.Svg,
              content: caret,
              style: {
                custom: {
                  [DEFAULT_BREAKPOINT_ID]: {
                    default: { margin: '0 8px 0 0' },
                  },
                },
                mixins: [imageNavStyleId],
              },
            },
            {
              id: imageId,
              name: 'Image',
              tag: Tag.Img,
              inputs: {
                src: {
                  type: ComponentArgPrimitive.String,
                  name: 'src',
                  attr: true,
                  default: '',
                  is: 'https://web.pubstudioassets.com/placeholder.png',
                },
                crossOrigin: {
                  name: 'crossOrigin',
                  type: ComponentArgPrimitive.String,
                  attr: true,
                  default: '',
                  is: 'anonymous',
                },
              },
              style: {
                custom: {
                  [DEFAULT_BREAKPOINT_ID]: {
                    default: {
                      width: 'auto',
                      'max-width': 'calc(95% - 80px)',
                      'object-fit': 'contain',
                    },
                  },
                },
                mixins: [imageStyle.id],
              },
              events: stopClickEvents,
            },
            {
              id: tempChildId,
              name: 'ImageRight',
              tag: Tag.Svg,
              content: caret,
              style: {
                custom: {
                  [DEFAULT_BREAKPOINT_ID]: {
                    default: { margin: '0 0 0 8px', transform: 'rotate(180deg)' },
                  },
                },
                mixins: [imageNavStyleId],
              },
            },
            {
              ...makeLoading(24),
              events: stopClickEvents,
            },
          ],
        },
        {
          id: tempChildId,
          name: 'LightboxBottom',
          tag: Tag.Div,
          style: {
            custom: {
              [DEFAULT_BREAKPOINT_ID]: {
                default: { height: '40px' },
              },
            },
            mixins: [horizontalStyleId],
          },
        },
      ],
    },
  ],
}

export const lightboxGallery: IComponent = {
  id: lightboxGalleryId,
  name: 'LightboxGallery',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: { width: '100%' },
      },
    },
  },
  children: [
    imageLightbox,
    {
      id: gridId,
      name: 'Grid',
      tag: Tag.Div,
      style: {
        custom: {},
        mixins: [lightboxGalleryStyle.id],
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
