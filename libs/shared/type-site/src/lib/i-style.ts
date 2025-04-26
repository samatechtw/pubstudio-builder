import { Css } from './enum-css'
import { CssPseudoClassType } from './enum-css-pseudo-class'

export interface IGlobalStyle {
  style: string
}

export interface IStyleEntry {
  pseudoClass: CssPseudoClassType
  property: Css
  value: string
}

export interface IInheritedStyleEntry extends IStyleEntry {
  sourceType: StyleSource
  sourceId: string
  sourceBreakpointId: string
  inheritedFrom: string | undefined
}

export interface IStyleOverrideEntry extends IStyleEntry {
  selector: string
}

export type IRawStyle = { [key in Css]?: string }

export type IPseudoStyle = { [key in CssPseudoClassType]?: IRawStyle }

// Use breakpoint id as key, IPseudoStyle as value
export type IBreakpointStyles = Record<string, IPseudoStyle>

export type IStyle = {
  id: string
  name: string
  breakpoints: IBreakpointStyles
}

export type IRawStyleWithSource = {
  sourceType: StyleSourceType
  sourceId: string
  sourceBreakpointId: string
  // Only used in mixins
  sourcePseudoClass?: CssPseudoClassType
  value: string
}

export type IRawStylesWithSource = {
  [key in Css]?: IRawStyleWithSource
}

export type IPseudoStyleWithSource = {
  [key in CssPseudoClassType]?: IRawStylesWithSource
}

// Use breakpoint id as key, IPseudoStyle as value
export type IBreakpointStylesWithSource = Record<string, IPseudoStyleWithSource>

// Use selector as key, IPseudoStyleWithSource as value
export type IOverrideStylesWithSource = Record<string, IPseudoStyleWithSource>
// Use breakpoint as key, IOverrideStylesWithSource as value
export type IBreakpointOverrideStylesWithSource = Record<
  string,
  IOverrideStylesWithSource
>

export enum StyleSource {
  Mixin = 'mixin',
  // Component source (is)
  Is = 'is',
  // Component custom style
  Custom = 'custom',
  CustomComponent = 'customComponent',
}

export type StyleSourceType = `${StyleSource}`
