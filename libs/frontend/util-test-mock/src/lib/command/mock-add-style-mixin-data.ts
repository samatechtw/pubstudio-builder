import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { IAddStyleMixinData } from '@pubstudio/shared/type-command-data'
import { IPseudoStyle } from '@pubstudio/shared/type-site'

export const mockAddStyleMixinData = (
  name: string | undefined,
  pseudoStyle: IPseudoStyle,
): IAddStyleMixinData => {
  const data: IAddStyleMixinData = {
    name,
    breakpoints: { [DEFAULT_BREAKPOINT_ID]: pseudoStyle },
  }
  return data
}
