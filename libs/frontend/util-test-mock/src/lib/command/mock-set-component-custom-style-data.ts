import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import { IStyleEntryWithInherited } from '@pubstudio/shared/type-site'

export const mockEditComponentCustomStyleData = (
  componentId: string,
  breakpointId: string,
  oldStyle: IStyleEntryWithInherited,
  newStyle: IStyleEntryWithInherited,
): ISetComponentCustomStyleData => {
  const data: ISetComponentCustomStyleData = {
    componentId,
    breakpointId,
    oldStyle,
    newStyle,
  }
  return data
}

export const mockAddComponentCustomStyleData = (
  componentId: string,
  breakpointId: string,
  newStyle: IStyleEntryWithInherited,
): ISetComponentCustomStyleData => {
  const data: ISetComponentCustomStyleData = {
    componentId,
    breakpointId,
    newStyle,
  }
  return data
}

export const mockRemoveComponentCustomStyleData = (
  componentId: string,
  breakpointId: string,
  style: IStyleEntryWithInherited,
): ISetComponentCustomStyleData => {
  const data: ISetComponentCustomStyleData = {
    componentId,
    breakpointId,
    oldStyle: style,
  }
  return data
}
