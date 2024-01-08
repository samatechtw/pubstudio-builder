import { ISetMixinEntryData } from '@pubstudio/shared/type-command-data'
import { IStyleEntry } from '@pubstudio/shared/type-site'

export const mockSetMixinEntryData = (
  mixinId: string,
  breakpointId: string,
  oldStyle: IStyleEntry,
  newStyle: IStyleEntry,
): ISetMixinEntryData => {
  const data: ISetMixinEntryData = {
    mixinId,
    breakpointId,
    oldStyle,
    newStyle,
  }
  return data
}

export const mockAddMixinEntryData = (
  mixinId: string,
  breakpointId: string,
  newStyle: IStyleEntry,
): ISetMixinEntryData => {
  const data: ISetMixinEntryData = {
    mixinId,
    breakpointId,
    newStyle,
  }
  return data
}

export const mockRemoveMixinEntryData = (
  mixinId: string,
  breakpointId: string,
  style: IStyleEntry,
): ISetMixinEntryData => {
  const data: ISetMixinEntryData = {
    mixinId,
    breakpointId,
    oldStyle: style,
  }
  return data
}
