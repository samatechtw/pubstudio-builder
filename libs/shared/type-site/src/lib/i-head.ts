export interface IHeadBase {
  href: string
  target?: string
}

export interface IHeadLink {
  href?: string
  rel?: string
  title?: string
  sizes?: string
  imagesizes?: string
  media?: string
  id?: string
  as?: string
  type?: string
  blocking?: string
  crossorigin?: string
}

export interface IHeadMeta {
  content?: string
  'http-equiv'?: string
  name?: string
  property?: string
}

export interface IHeadScript {
  id?: string
  src?: string
  type?: string
  async?: boolean
  blocking?: string
}

export interface IHead {
  title?: string
  description?: string
  base?: IHeadBase
  link?: IHeadLink[]
  meta?: IHeadMeta[]
  script?: IHeadScript[]
}

export type IHeadObject = string | IHeadBase | IHeadLink | IHeadMeta | IHeadScript
export type IPageHeadObject = IHeadLink | IHeadMeta | IHeadScript

export type IPageHead = IHead

export type IHeadTag = keyof IHead

export type IPageHeadTag = keyof IPageHead

export type IHeadTagStr = IHeadTag | IPageHeadTag
