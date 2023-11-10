import {
  DEFAULT_BREAKPOINT_ID,
  h1Id,
  h1StyleId,
  h2Id,
  h2StyleId,
  h3Id,
  h3StyleId,
  h4Id,
  h4StyleId,
  h5Id,
  h5StyleId,
  h6Id,
  h6StyleId,
} from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const h1Style: IStyle = {
  id: h1StyleId,
  name: 'H1Style',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '${size-h1}',
        'font-family': '${font-title}',
        'font-weight': '600',
        margin: '0',
        'line-height': '125%',
      },
    },
  },
}

export const h1: IComponent = {
  id: h1Id,
  name: 'H1',
  tag: Tag.H1,
  content: 'Heading 1',
  style: {
    custom: {},
    mixins: [h1Style.id],
  },
}

export const h2Style: IStyle = {
  id: h2StyleId,
  name: 'H2Style',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '${size-h2}',
        'font-family': '${font-title}',
        'font-weight': '600',
        margin: '0',
        'line-height': '125%',
      },
    },
  },
}

export const h2: IComponent = {
  id: h2Id,
  name: 'H2',
  tag: Tag.H2,
  content: 'Heading 2',
  style: {
    custom: {},
    mixins: [h2Style.id],
  },
}

export const h3Style: IStyle = {
  id: h3StyleId,
  name: 'H3Style',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '${size-h3}',
        'font-family': '${font-title}',
        'font-weight': '600',
        margin: '0',
        'line-height': '125%',
      },
    },
  },
}

export const h3: IComponent = {
  id: h3Id,
  name: 'H3',
  tag: Tag.H3,
  content: 'Heading 3',
  style: {
    custom: {},
    mixins: [h3Style.id],
  },
}

export const h4Style: IStyle = {
  id: h4StyleId,
  name: 'H4Style',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '${size-h4}',
        'font-family': '${font-title}',
        'font-weight': '600',
        margin: '0',
        'line-height': '125%',
      },
    },
  },
}

export const h4: IComponent = {
  id: h4Id,
  name: 'H4',
  tag: Tag.H4,
  content: 'Heading 4',
  style: {
    custom: {},
    mixins: [h4Style.id],
  },
}

export const h5Style: IStyle = {
  id: h5StyleId,
  name: 'H5Style',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '${size-h5}',
        'font-family': '${font-title}',
        'font-weight': '600',
        margin: '0',
        'line-height': '125%',
      },
    },
  },
}

export const h5: IComponent = {
  id: h5Id,
  name: 'H5',
  tag: Tag.H5,
  content: 'Heading 5',
  style: {
    custom: {},
    mixins: [h5Style.id],
  },
}

export const h6Style: IStyle = {
  id: h6StyleId,
  name: 'H6Style',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        'font-size': '${size-h6}',
        'font-family': '${font-title}',
        'font-weight': '600',
        margin: '0',
        'line-height': '125%',
      },
    },
  },
}

export const h6: IComponent = {
  id: h6Id,
  name: 'H6',
  tag: Tag.H6,
  content: 'Heading 6',
  style: {
    custom: {},
    mixins: [h6Style.id],
  },
}
