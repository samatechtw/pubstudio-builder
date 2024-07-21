import {
  DEFAULT_BREAKPOINT_ID,
  headerId,
  headerLogoId,
  headerLogoLinkId,
  headerStyleId,
  homeLinkBehaviorId,
  horizontalStyleId,
} from '@pubstudio/frontend/util-ids'
import { ComponentEventType, IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'
import { defaultImageInputs } from '../default-inputs'
import { image } from './builtin-image'
import { link } from './builtin-link'
import { makeNavMenu } from './builtin-nav-menu'

export const headerStyle: IStyle = {
  id: headerStyleId,
  name: 'HeaderStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'min-height': '72px',
        height: '72px',
        'align-items': 'center',
        padding: '8px 0px 8px 16px',
      },
    },
  },
}

export const headerLogo: IComponent = {
  ...image,
  id: headerLogoId,
  style: { custom: { [DEFAULT_BREAKPOINT_ID]: { default: { height: '80%' } } } },
  inputs: defaultImageInputs(''),
}

export const headerLogoLink: IComponent = {
  ...link,
  id: headerLogoLinkId,
  style: {
    ...link.style,
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: { height: '100%', display: 'flex', 'align-items': 'center' },
      },
    },
  },
  events: {
    [ComponentEventType.OnAppear]: {
      name: ComponentEventType.OnAppear,
      behaviors: [{ behaviorId: homeLinkBehaviorId }],
    },
  },
  children: [headerLogo],
}

export const headerNavMenu = makeNavMenu()

export const header: IComponent = {
  id: headerId,
  name: 'Header',
  tag: Tag.Header,
  style: {
    custom: {},
    mixins: [horizontalStyleId, headerStyle.id],
  },
  // TODO -- think of a way to automatically include the site logo
  // TODO -- responsive layout with nav hamburger menu
  children: [headerLogoLink, headerNavMenu],
}
