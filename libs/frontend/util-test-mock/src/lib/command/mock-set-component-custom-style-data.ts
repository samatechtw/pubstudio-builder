import { ISetComponentCustomStyleData } from '@pubstudio/shared/type-command-data'
import { IStyleEntry } from '@pubstudio/shared/type-site'

export const mockEditComponentCustomStyleData = (
  componentId: string,
  breakpointId: string,
  oldStyle: IStyleEntry,
  newStyle: IStyleEntry,
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
  newStyle: IStyleEntry,
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
  style: IStyleEntry,
): ISetComponentCustomStyleData => {
  const data: ISetComponentCustomStyleData = {
    componentId,
    breakpointId,
    oldStyle: style,
  }
  return data
}
