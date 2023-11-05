import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ITranslations } from '@pubstudio/shared/type-site'

export type INewTranslations = Record<string, string | undefined>

// We need to be able to recreate the component for undo
// Note - is it better to represent translations as an array, e.g.
//   translations: { key: [oldVal, newVal] }
export interface ISetTranslationsData {
  code: string
  oldTranslations?: ITranslations
  newTranslations?: INewTranslations
}

export interface SetTranslations extends ICommand<ISetTranslationsData> {
  type: CommandType.SetTranslations
}
