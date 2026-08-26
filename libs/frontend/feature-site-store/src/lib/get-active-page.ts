import { activeCanvasPage } from '@pubstudio/frontend/data-access-command'
import { IPage, ISite } from '@pubstudio/shared/type-site'

export const getActivePage = (site: ISite): IPage | undefined => activeCanvasPage(site)
