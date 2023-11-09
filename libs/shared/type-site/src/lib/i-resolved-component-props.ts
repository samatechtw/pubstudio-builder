import { IComponent } from './i-component'

// IComponent properties which can be inherited
export type IResolvedComponentProps = Pick<
  IComponent,
  'inputs' | 'events' | 'style' | 'editorEvents'
>
