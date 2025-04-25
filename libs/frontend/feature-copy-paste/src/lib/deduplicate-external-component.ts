import { makeAddBuiltinStyleMixin } from '@pubstudio/frontend/data-access-command'
import { builtinBehaviors, builtinStyles } from '@pubstudio/frontend/util-builtin'
import { nextBehaviorId, nextStyleId } from '@pubstudio/frontend/util-ids'
import { iterateComponent } from '@pubstudio/frontend/util-render'
import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import {
  IBehavior,
  IBreakpoint,
  ICopiedComponent,
  ISite,
  IStyle,
} from '@pubstudio/shared/type-site'

export const deduplicateExternalComponent = (
  site: ISite,
  copiedComponent: ICopiedComponent,
): ICopiedComponent => {
  const { styles, component, behaviors, translations, breakpoints, theme } =
    copiedComponent
  const currentStyles = Object.values(site.context.styles)
  const newStyles: Record<string, IStyle> = {}
  const styleIdMap: Record<string, string> = {}

  const currentBehaviors = Object.values(site.context.behaviors)
  const newBehaviors: Record<string, IBehavior> = {}
  const behaviorIdMap: Record<string, string> = {}
  // Remove behaviors that already exist in the target site
  for (const behavior of behaviors) {
    const builtinBehavior = builtinBehaviors[behavior.id]
    if (builtinBehavior && !resolveBehavior(site.context, behavior.id)) {
      newBehaviors[behavior.id] = behavior
    } else {
      const existingBehavior = currentBehaviors.find((b) => b.name === behavior.name)
      if (existingBehavior) {
        styleIdMap[behavior.id] = existingBehavior.id
      } else {
        const newBehaviorId = nextBehaviorId(site.context)
        behaviorIdMap[behavior.id] = newBehaviorId
        behavior.id = newBehaviorId
        newBehaviors[behavior.id] = behavior
      }
    }
  }
  // Map source site breakpoints to target site.
  // Only include breakpoints that are actually used in components and styles
  // Breakpoints that can't be mapped will be created
  const newBreakpoints: Record<string, IBreakpoint> = {}

  // Remove styles that already exist in the target site
  // Map source site ID to target site ID
  for (const style of styles) {
    for (const bp of Object.keys(style.breakpoints)) {
      if (!newBreakpoints[bp]) {
        newBreakpoints[bp] = breakpoints[bp]
      }
    }
    const styleCmd = makeAddBuiltinStyleMixin(site.context, style.id)
    if (builtinStyles[style.id]) {
      // TODO -- this is messy, it's cleaner to generate command data separately
      // In this case it works because the style is used directly as command data in pasteExternalComponent
      if (styleCmd) {
        newStyles[style.id] = styleCmd.data as IStyle
      }
    } else {
      const existingStyle = currentStyles.find((s) => s.name === style.name)
      if (existingStyle) {
        styleIdMap[style.id] = existingStyle.id
      } else {
        const newStyleId = nextStyleId(site.context)
        styleIdMap[style.id] = newStyleId
        style.id = newStyleId
        newStyles[style.id] = style
      }
    }
  }

  iterateComponent(component, (cmp) => {
    cmp.style.mixins = cmp.style.mixins?.map((mId) => styleIdMap[mId] ?? mId)
    // Add used breakpoints to list
    for (const bp of Object.keys(cmp.style.custom)) {
      if (!newBreakpoints[bp]) {
        newBreakpoints[bp] = breakpoints[bp]
      }
    }
    if (cmp.events) {
      for (const ev of Object.values(cmp.events)) {
        for (const behavior of ev.behaviors) {
          const bId = behavior.behaviorId
          behavior.behaviorId = behaviorIdMap[bId] ?? bId
        }
      }
    }
  })
  return {
    siteId: copiedComponent.siteId,
    component,
    breakpoints: newBreakpoints,
    translations,
    behaviors: Object.values(behaviors),
    styles: Object.values(newStyles),
    theme,
  }
}
