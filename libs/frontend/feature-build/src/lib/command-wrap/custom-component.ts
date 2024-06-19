import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { getActivePage } from '@pubstudio/frontend/feature-site-store'
import { makeAddCustomComponentData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

export const addCustomComponentAtSelection = (site: ISite, customComponentId: string) => {
  const selectedComponent = site.editor?.selectedComponent
  const activePage = getActivePage(site)

  const data = makeAddCustomComponentData(
    site,
    customComponentId,
    selectedComponent ?? (activePage?.root as IComponent),
    selectedComponent?.id,
  )
  if (data) {
    pushCommand(site, CommandType.AddComponent, data)
  }
}
