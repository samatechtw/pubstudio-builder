import { IComponent } from './i-component'
import { IPageHead } from './i-head'

export interface IPageMetadata {
  name: string
  public: boolean
  route: string
  head: IPageHead
}

export interface IPage extends IPageMetadata {
  root: IComponent
}
