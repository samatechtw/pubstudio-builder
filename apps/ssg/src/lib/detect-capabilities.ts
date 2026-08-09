import { iteratePage } from '@pubstudio/frontend/util-render'
import { IComponent, ISite, Tag } from '@pubstudio/shared/type-site'

// Reports site features that stop working without the hydration runtime.
// Used to refuse or warn about `noJs` output.
export const detectNoJsBlockers = (site: ISite): string[] => {
  const blockers: string[] = []
  const seen = new Set<string>()
  const addBlocker = (blocker: string) => {
    if (!seen.has(blocker)) {
      seen.add(blocker)
      blockers.push(blocker)
    }
  }
  const checkComponent = (component: IComponent) => {
    const sourceEvents = component.customSourceId
      ? site.context.components[component.customSourceId]?.events
      : undefined
    if (
      Object.keys(component.events ?? {}).length ||
      Object.keys(sourceEvents ?? {}).length
    ) {
      addBlocker(`events/behaviors on component ${component.id}`)
    }
    if (component.tag === Tag.Vue) {
      addBlocker(`custom Vue component ${component.id}`)
    }
    if (component.tag === Tag.Form) {
      addBlocker(`form ${component.id}`)
    }
  }
  for (const page of Object.values(site.pages)) {
    if (page.public) {
      iteratePage(page, checkComponent)
    }
  }
  return blockers
}
