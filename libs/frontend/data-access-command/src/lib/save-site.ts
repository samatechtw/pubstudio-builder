import { ISite } from '@pubstudio/shared/type-site'
import { snapshotArena } from './custom-component/component-arena'

export const saveSite = (site: ISite) => {
  snapshotArena(site)
  site.editor?.store?.save?.(site)
}
