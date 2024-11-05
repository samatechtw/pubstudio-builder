import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { iterateSite } from '@pubstudio/frontend/util-render'
import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetBehaviorData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { appendLastCommand } from '../replace-last-command'

export const migrateV1ToV2 = (site: ISite) => {
  // All behaviors must now be copied into the site, since they are
  // no longer present in the web-site bundle
  const builtinIds = Object.keys(builtinBehaviors)
  const commands: ICommand[] = []
  const addedIds = new Set()
  iterateSite(site, (component) => {
    const behaviorIds = Object.values(component.events ?? {}).flatMap((ev) =>
      ev.behaviors.map((b) => b.behaviorId),
    )
    for (const behaviorId of behaviorIds) {
      const behavior = resolveBehavior(site.context, behaviorId)
      const builtinId = builtinIds.find((bid) => bid === behaviorId)
      // Skip if the behavior already has code
      if (!behavior?.code && builtinId && !addedIds.has(builtinId)) {
        const data: ISetBehaviorData = {
          oldBehavior: clone(behavior),
          newBehavior: { ...clone(builtinBehaviors[builtinId]) },
        }
        commands.push({ type: CommandType.SetBehavior, data })
        addedIds.add(builtinId)
      }
    }
  })
  if (commands.length) {
    appendLastCommand(site, { type: CommandType.Group, data: { commands } })
  }
  console.log(`Completed migration from version ${site.version} to 2`)
  site.version = '2'
}

export const migrateV2ToV1 = (site: ISite) => {
  // Lazily set the version back to 1
  // This is because V2 is backwards compatible with V1
  site.version = '1'
}
