import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ITranslations } from '@pubstudio/shared/type-site'

export interface IReplaceTranslationsData {
  oldTranslations: Record<string, ITranslations>
  newTranslations: Record<string, ITranslations>
}

export interface ReplaceTranslations extends ICommand<IReplaceTranslationsData> {
  type: CommandType.ReplaceTranslations
}
