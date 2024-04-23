// Pre-define builtin IDs to avoid circular reference

import { defaultContext } from './default-context'
import { behaviorId, componentId, nextStyleId, styleId } from './make-ids'

// Public behaviors
export const noBehaviorId = behaviorId(defaultContext.namespace, 'none')
export const toggleHiddenId = behaviorId(defaultContext.namespace, 'toggleHidden')
export const setHiddenId = behaviorId(defaultContext.namespace, 'setHidden')
export const navMenuBehaviorId = behaviorId(defaultContext.namespace, 'navChildren')
export const setupLoaderBehaviorId = behaviorId(defaultContext.namespace, 'setupLoader')
export const navItemBehaviorId = behaviorId(defaultContext.namespace, 'navItem')
export const homeLinkBehaviorId = behaviorId(defaultContext.namespace, 'homeLink')

// Builtin components and styles
export const buttonStyleId = nextStyleId(defaultContext)
export const buttonId = componentId(defaultContext.namespace, 'button')
export const horizontalStyleId = nextStyleId(defaultContext)
export const containerHorizontalId = componentId(
  defaultContext.namespace,
  'containerHorizontal',
)
export const verticalStyleId = nextStyleId(defaultContext)
export const containerVerticalId = componentId(
  defaultContext.namespace,
  'containerVertical',
)
export const footerStyleId = nextStyleId(defaultContext)
export const footerId = componentId(defaultContext.namespace, 'footer')
export const navMenuStyleId = nextStyleId(defaultContext)
export const navMenuItemStyleId = nextStyleId(defaultContext)
export const navMenuId = componentId(defaultContext.namespace, 'navmenu')
export const navMenuItemId = componentId(defaultContext.namespace, 'navmenuitem')
export const imageStyleId = nextStyleId(defaultContext)
export const imageId = componentId(defaultContext.namespace, 'image')
export const linkStyleId = nextStyleId(defaultContext)
export const linkId = componentId(defaultContext.namespace, 'link')
export const textStyleId = nextStyleId(defaultContext)
export const textId = componentId(defaultContext.namespace, 'text')
export const h1StyleId = nextStyleId(defaultContext)
export const h1Id = componentId(defaultContext.namespace, 'h1')
export const h2StyleId = nextStyleId(defaultContext)
export const h2Id = componentId(defaultContext.namespace, 'h2')
export const h3StyleId = nextStyleId(defaultContext)
export const h3Id = componentId(defaultContext.namespace, 'h3')
export const h4StyleId = nextStyleId(defaultContext)
export const h4Id = componentId(defaultContext.namespace, 'h4')
export const h5StyleId = nextStyleId(defaultContext)
export const h5Id = componentId(defaultContext.namespace, 'h5')
export const h6StyleId = nextStyleId(defaultContext)
export const h6Id = componentId(defaultContext.namespace, 'h6')
export const svgStyleId = nextStyleId(defaultContext)
export const svgId = componentId(defaultContext.namespace, 'svg')
export const listStyleId = nextStyleId(defaultContext)
export const listItemStyleId = nextStyleId(defaultContext)
export const ulId = componentId(defaultContext.namespace, 'ul')
export const ollId = componentId(defaultContext.namespace, 'ol')
export const liId = componentId(defaultContext.namespace, 'li')
export const dividerVerticalStyleId = nextStyleId(defaultContext)
export const dividerVerticalId = componentId(defaultContext.namespace, 'dividerVertical')
export const dividerHorizontalStyleId = nextStyleId(defaultContext)
export const dividerHorizontalId = componentId(
  defaultContext.namespace,
  'dividerHorizontal',
)
export const captionedImageStyleId = styleId(defaultContext.namespace, 'captionedImage')
export const captionedImageId = componentId(defaultContext.namespace, 'captionedImage')

// Form
export const inputStyleId = nextStyleId(defaultContext)
export const inputId = componentId(defaultContext.namespace, 'input')

export const headerStyleId = nextStyleId(defaultContext)
export const headerId = componentId(defaultContext.namespace, 'header')
export const headerLogoId = componentId(defaultContext.namespace, 'headerLogo')
export const headerLogoLinkId = componentId(defaultContext.namespace, 'headerLogoLink')
export const headerNavMenuId = componentId(defaultContext.namespace, 'headerNavMenu')

export const textareaStyleId = nextStyleId(defaultContext)
export const textareaId = componentId(defaultContext.namespace, 'textarea')

// Advanced
export const contactFormId = componentId(defaultContext.namespace, 'contactform')
export const contactFormBehaviorId = behaviorId(defaultContext.namespace, 'contactform')
export const clearErrorBehaviorId = behaviorId(
  defaultContext.namespace,
  'contactformclearerror',
)
export const loadingId = componentId(defaultContext.namespace, 'loading')
export const loadingStyleId = styleId(defaultContext.namespace, 'loading')
export const loadingDotStyleId = styleId(defaultContext.namespace, 'loadingdot')
// Placeholder for children of builtin components that aren't used independently
export const tempChildId = componentId(defaultContext.namespace, 'tempchild')
