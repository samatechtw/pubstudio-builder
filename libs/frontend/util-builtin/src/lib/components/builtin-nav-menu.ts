import {
  DEFAULT_BREAKPOINT_ID,
  horizontalStyleId,
  navItemBehaviorId,
  navMenuBehaviorId,
  navMenuId,
  navMenuItemId,
  navMenuItemStyleId,
  navMenuStyleId,
} from '@pubstudio/frontend/util-ids'
import { EditorEventName, IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'
import { defaultNavMenuItemInputs } from '../default-inputs'

export const navMenuStyle: IStyle = {
  id: navMenuStyleId,
  name: 'NavMenuStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        height: '100%',
        'font-size': '22px',
        'align-items': 'center',
        color: '${color-primary}',
      },
    },
  },
}

export const navMenuItemStyle: IStyle = {
  id: navMenuItemStyleId,
  name: 'NavMenuItemStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        padding: '0 0 2px 0',
        'border-bottom': '1px solid ${color-primary}',
        margin: '0 0 0 16px',
        cursor: 'pointer',
      },
    },
  },
}

export const makeNavMenu = (): IComponent => {
  return {
    id: navMenuId,
    name: 'NavMenu',
    tag: Tag.Div,
    style: {
      custom: {},
      mixins: [horizontalStyleId, navMenuStyle.id],
    },
    editorEvents: {
      [EditorEventName.OnSelfAdded]: {
        name: EditorEventName.OnSelfAdded,
        behaviors: [{ behaviorId: navMenuBehaviorId }],
      },
      [EditorEventName.OnPageChange]: {
        name: EditorEventName.OnPageChange,
        behaviors: [{ behaviorId: navMenuBehaviorId }],
      },
    },
  }
}

export const navMenu = makeNavMenu()

export const navMenuItem: IComponent = {
  id: navMenuItemId,
  name: 'NavItem',
  tag: Tag.A,
  style: {
    custom: {},
    mixins: [navMenuItemStyle.id],
  },
  editorEvents: {
    [EditorEventName.OnIsInputChange]: {
      name: EditorEventName.OnIsInputChange,
      behaviors: [{ behaviorId: navItemBehaviorId }],
    },
  },
  inputs: defaultNavMenuItemInputs(),
}
