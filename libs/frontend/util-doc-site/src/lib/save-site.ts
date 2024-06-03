import { saveFile } from '@pubstudio/frontend/util-doc'
import { stringifySite } from '@pubstudio/frontend/util-site-store'
import { ISite } from '@pubstudio/shared/type-site'
import { format } from 'date-fns/format'

export const saveSite = (site: ISite | undefined, fileName: string) => {
  if (site) {
    saveFile(fileName, stringifySite(site, true), 'json')
  }
}

export const defaultExportedFileName = (siteName: string): string => {
  const date = format(new Date(), 'yyyyMMdd-HHmmss')
  return `pub-${siteName}${date}.json`
}
