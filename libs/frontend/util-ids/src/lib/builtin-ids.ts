// Pre-define builtin IDs to avoid circular reference

import { behaviorId, componentId, nextStyleId } from './generate-ids'
import { globalContext } from './global-context'

// Public behaviors
export const noBehaviorId = behaviorId(globalContext.namespace, 'none')
export const toggleHiddenId = behaviorId(globalContext.namespace, 'toggleHidden')
export const setHiddenId = behaviorId(globalContext.namespace, 'setHidden')
export const navMenuBehaviorId = behaviorId(globalContext.namespace, 'navChildren')
export const navItemBehaviorId = behaviorId(globalContext.namespace, 'navItem')
export const homeLinkBehaviorId = behaviorId(globalContext.namespace, 'homeLink')

// Builtin components and styles
export const buttonStyleId = nextStyleId(globalContext)
export const buttonId = componentId(globalContext.namespace, 'button')
export const horizontalStyleId = nextStyleId(globalContext)
export const containerHorizontalId = componentId(
  globalContext.namespace,
  'containerHorizontal',
)
export const verticalStyleId = nextStyleId(globalContext)
export const containerVerticalId = componentId(
  globalContext.namespace,
  'containerVertical',
)
export const footerStyleId = nextStyleId(globalContext)
export const footerId = componentId(globalContext.namespace, 'footer')
export const navMenuStyleId = nextStyleId(globalContext)
export const navMenuItemStyleId = nextStyleId(globalContext)
export const navMenuId = componentId(globalContext.namespace, 'navmenu')
export const navMenuItemId = componentId(globalContext.namespace, 'navmenuitem')
export const imageStyleId = nextStyleId(globalContext)
export const imageId = componentId(globalContext.namespace, 'image')
export const linkStyleId = nextStyleId(globalContext)
export const linkId = componentId(globalContext.namespace, 'link')
export const textStyleId = nextStyleId(globalContext)
export const textId = componentId(globalContext.namespace, 'text')
export const h1StyleId = nextStyleId(globalContext)
export const h1Id = componentId(globalContext.namespace, 'h1')
export const h2StyleId = nextStyleId(globalContext)
export const h2Id = componentId(globalContext.namespace, 'h2')
export const h3StyleId = nextStyleId(globalContext)
export const h3Id = componentId(globalContext.namespace, 'h3')
export const h4StyleId = nextStyleId(globalContext)
export const h4Id = componentId(globalContext.namespace, 'h4')
export const h5StyleId = nextStyleId(globalContext)
export const h5Id = componentId(globalContext.namespace, 'h5')
export const h6StyleId = nextStyleId(globalContext)
export const h6Id = componentId(globalContext.namespace, 'h6')
export const svgStyleId = nextStyleId(globalContext)
export const svgId = componentId(globalContext.namespace, 'svg')

// Form
export const inputStyleId = nextStyleId(globalContext)
export const inputId = componentId(globalContext.namespace, 'input')

export const headerStyleId = nextStyleId(globalContext)
export const headerId = componentId(globalContext.namespace, 'header')
export const headerLogoId = componentId(globalContext.namespace, 'headerLogo')
export const headerLogoLinkId = componentId(globalContext.namespace, 'headerLogoLink')
export const headerNavMenuId = componentId(globalContext.namespace, 'headerNavMenu')
