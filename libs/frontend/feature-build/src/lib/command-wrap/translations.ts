import { pushCommand, replaceLastCommand } from '@pubstudio/frontend/data-access-command'
import { makeSetTranslationsData } from '@pubstudio/frontend/util-command-data'
import { clone } from '@pubstudio/frontend/util-component'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  INewTranslations,
  IReplaceTranslationsData,
} from '@pubstudio/shared/type-command-data'
import { ISite, ITranslations } from '@pubstudio/shared/type-site'

export type ISetTranslationsProps = {
  code: string
  translations: INewTranslations
  replace?: boolean
  forceSave?: boolean
}

export const setTranslations = (site: ISite, props: ISetTranslationsProps) => {
  const { code, translations, replace, forceSave } = props
  const data = makeSetTranslationsData(site.context, code, translations)
  if (replace) {
    replaceLastCommand(
      site,
      { type: CommandType.SetTranslations, data },
      forceSave ?? false,
    )
  } else {
    pushCommand(site, CommandType.SetTranslations, data)
  }
}

export const replaceAllTranslations = (
  site: ISite,
  newTranslations: Record<string, ITranslations>,
) => {
  const oldTranslations = clone(site.context.i18n)

  const data: IReplaceTranslationsData = { oldTranslations, newTranslations }
  pushCommand(site, CommandType.ReplaceTranslations, data)
}
