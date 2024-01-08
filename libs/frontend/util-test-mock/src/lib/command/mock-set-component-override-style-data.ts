import { ISetComponentOverrideStyleData } from '@pubstudio/shared/type-command-data'
import { IStyleEntry } from '@pubstudio/shared/type-site'

export const mockEditComponentOverrideStyleData = (
  componentId: string,
  selector: string,
  breakpointId: string,
  oldStyle: IStyleEntry,
  newStyle: IStyleEntry,
): ISetComponentOverrideStyleData => {
  const data: ISetComponentOverrideStyleData = {
    componentId,
    selector,
    breakpointId,
    oldStyle,
    newStyle,
  }
  return data
}

export const mockAddComponentOverrideStyleData = (
  componentId: string,
  selector: string,
  breakpointId: string,
  newStyle: IStyleEntry,
): ISetComponentOverrideStyleData => {
  const data: ISetComponentOverrideStyleData = {
    componentId,
    selector,
    breakpointId,
    newStyle,
  }
  return data
}

export const mockRemoveComponentOverrideStyleEntryData = (
  componentId: string,
  selector: string,
  breakpointId: string,
  style: IStyleEntry,
): ISetComponentOverrideStyleData => {
  const data: ISetComponentOverrideStyleData = {
    componentId,
    selector,
    breakpointId,
    oldStyle: style,
  }
  return data
}
