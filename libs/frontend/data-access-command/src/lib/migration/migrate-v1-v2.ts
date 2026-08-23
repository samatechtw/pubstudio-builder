import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { iterateSite } from '@pubstudio/frontend/util-render'
import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import { ISite } from '@pubstudio/shared/type-site'

export const migrateV1ToV2 = (site: ISite) => {
  // All behaviors must now be copied into the site, since they are
  // no longer present in the web-site bundle
  iterateSite(site, (component) => {
    const behaviorIds = Object.values(component.events ?? {}).flatMap((ev) =>
      ev.behaviors.map((b) => b.behaviorId),
    )
    for (const behaviorId of behaviorIds) {
      const behavior = resolveBehavior(site.context, behaviorId)
      const builtin = builtinBehaviors[behaviorId]
      // Skip if the behavior already has code
      if (!behavior?.code && builtin) {
        site.context.behaviors[behaviorId] = clone(builtin)
      }
    }
  })
  console.log(`Completed migration from version ${site.version} to 2`)
  site.version = '2'
}
