// Pre-define builtin IDs to avoid circular reference

import { globalContext } from './global-context'
import { behaviorId, componentId, nextStyleId, styleId } from './make-ids'

// Public behaviors
export const noBehaviorId = behaviorId(globalContext.namespace, 'none')
export const toggleHiddenId = behaviorId(globalContext.namespace, 'toggleHidden')
export const setHiddenId = behaviorId(globalContext.namespace, 'setHidden')
export const navMenuAddBehaviorId = behaviorId(globalContext.namespace, 'navAddChildren')
export const navMenuChangeBehaviorId = behaviorId(
  globalContext.namespace,
  'navChangeChildren',
)
export const navMenuRemoveBehaviorId = behaviorId(
  globalContext.namespace,
  'navRemoveChildren',
)
export const setupLoaderBehaviorId = behaviorId(globalContext.namespace, 'setupLoader')
export const navItemBehaviorId = behaviorId(globalContext.namespace, 'navItem')
export const homeLinkBehaviorId = behaviorId(globalContext.namespace, 'homeLink')

export const selectLanguageBehaviorId = behaviorId(
  globalContext.namespace,
  'selectLanguage',
)
export const setupLanguageBehaviorId = behaviorId(
  globalContext.namespace,
  'setupLanguage',
)

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
export const listStyleId = nextStyleId(globalContext)
export const listItemStyleId = nextStyleId(globalContext)
export const ulId = componentId(globalContext.namespace, 'ul')
export const ollId = componentId(globalContext.namespace, 'ol')
export const liId = componentId(globalContext.namespace, 'li')
export const dividerVerticalStyleId = nextStyleId(globalContext)
export const dividerVerticalId = componentId(globalContext.namespace, 'dividerVertical')
export const dividerHorizontalStyleId = nextStyleId(globalContext)
export const dividerHorizontalId = componentId(
  globalContext.namespace,
  'dividerHorizontal',
)
export const captionedImageStyleId = styleId(globalContext.namespace, 'captionedImage')
export const captionedImageId = componentId(globalContext.namespace, 'captionedImage')
export const backgroundImageStyleId = styleId(globalContext.namespace, 'backgroundImage')
export const backgroundImageId = componentId(globalContext.namespace, 'backgroundImage')

// Form
export const inputStyleId = nextStyleId(globalContext)
export const inputId = componentId(globalContext.namespace, 'input')

export const headerStyleId = nextStyleId(globalContext)
export const headerId = componentId(globalContext.namespace, 'header')
export const headerLogoId = componentId(globalContext.namespace, 'headerLogo')
export const headerLogoLinkId = componentId(globalContext.namespace, 'headerLogoLink')
export const headerNavMenuId = componentId(globalContext.namespace, 'headerNavMenu')

export const textareaStyleId = nextStyleId(globalContext)
export const textareaId = componentId(globalContext.namespace, 'textarea')
export const labelStyleId = nextStyleId(globalContext)
export const labelId = componentId(globalContext.namespace, 'label')

// Advanced
export const contactFormId = componentId(globalContext.namespace, 'contactform')
export const contactFormBehaviorId = behaviorId(globalContext.namespace, 'contactform')
export const mailingListId = componentId(globalContext.namespace, 'mailinglist')
export const mailingListBehaviorId = behaviorId(globalContext.namespace, 'mailinglist')
export const clearErrorBehaviorId = behaviorId(
  globalContext.namespace,
  'contactformclearerror',
)
export const loadingId = componentId(globalContext.namespace, 'loading')
export const loadingStyleId = styleId(globalContext.namespace, 'loading')
export const loadingDotStyleId = styleId(globalContext.namespace, 'loadingdot')
export const viewCounterId = componentId(globalContext.namespace, 'viewcounter')
export const viewCounterBehaviorId = behaviorId(globalContext.namespace, 'viewcounter')
export const vueComponentId = componentId(globalContext.namespace, 'vuecomponent')
export const languagesId = componentId(globalContext.namespace, 'languages')
export const langDisplayStyleId = nextStyleId(globalContext)
export const langTextStyleId = nextStyleId(globalContext)
export const caretRightStyleId = nextStyleId(globalContext)
export const caretBubbleStyleId = nextStyleId(globalContext)
export const langOptionStyleId = nextStyleId(globalContext)
export const langOptionsStyleId = nextStyleId(globalContext)

// Placeholder for children of builtin components that aren't used independently
export const tempChildId = componentId(globalContext.namespace, 'tempchild')
