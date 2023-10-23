import { Css } from './enum-css'
import { CssPseudoClass } from './enum-css-pseudo-class'

export interface IStyleEntry {
  pseudoClass: CssPseudoClass
  property: Css
  value: string
}

export interface IInheritedStyleEntry extends IStyleEntry {
  sourceType: StyleSourceType
  sourceId: string
  sourceBreakpointId: string
}

export type IRawStyle = { [key in Css]?: string }

export type IPseudoStyle = { [key in CssPseudoClass]?: IRawStyle }

// Use breakpoint id as key, IPseudoStyle as value
export type IBreakpointStyles = Record<string, IPseudoStyle>

export type IStyle = {
  id: string
  name: string
  breakpoints: IBreakpointStyles
}

export type IActiveBreakpointStyle = {
  id: string
  name: string
  pseudoStyle: IPseudoStyle
}

export type IRawStyleWithSource = {
  sourceType: StyleSourceType
  sourceId: string
  sourceBreakpointId: string
  value: string
}

export type IRawStylesWithSource = {
  [key in Css]?: IRawStyleWithSource
}

export type IPseudoStyleWithSource = { [key in CssPseudoClass]?: IRawStylesWithSource }

// Use breakpoint id as key, IPseudoStyle as value
export type IBreakpointStylesWithSource = Record<string, IPseudoStyleWithSource>

export enum StyleSourceType {
  Mixin = 'mixin',
  // Component source (is)
  Is = 'is',
  // Component custom style
  Custom = 'custom',
}
