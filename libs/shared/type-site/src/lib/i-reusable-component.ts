import { IComponent } from './i-component'

export interface IReusableComponent
  extends Omit<IComponent, 'parent' | 'children' | 'reusableComponentData' | 'state'> {
  parentId?: string
  children?: IReusableComponent[]
}
