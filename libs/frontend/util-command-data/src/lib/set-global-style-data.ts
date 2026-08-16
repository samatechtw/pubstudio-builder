import { ISetGlobalStyleData } from '@pubstudio/shared/type-command-data'
import { IGlobalStyle, ISite } from '@pubstudio/shared/type-site'

// An undefined `newStyle` removes the global style; `newName` renames it
export const makeSetGlobalStyleData = (
  site: ISite,
  name: string,
  newName: string | undefined,
  newStyle: IGlobalStyle | undefined,
): ISetGlobalStyleData => ({
  name,
  newName,
  oldStyle: site.context.globalStyles[name],
  newStyle,
})
