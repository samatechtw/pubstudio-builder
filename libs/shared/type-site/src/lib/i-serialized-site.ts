import { IComponent } from './i-component'
import { IEditorContext } from './i-editor-context'
import { IPage } from './i-page'
import { ISite } from './i-site'
import { ISiteContext } from './i-site-context'

// Internal type for serialization
export interface ISerializedSite extends Omit<ISite, 'context' | 'pages' | 'editor'> {
  context: ISerializedSiteContext
  pages: Record<string, ISerializedPage>
  editor?: ISerializedEditorContext
}

export interface ISerializedSiteContext extends Omit<ISiteContext, 'components'> {}

export interface ISerializedEditorContext
  extends Omit<
    IEditorContext,
    'selectedComponent' | 'selectedThemeColors' | 'reusableComponentIds'
  > {
  selectedComponentId?: string
  selectedThemeColors: string[]
  reusableComponentIds: string[]
}

export interface ISerializedPage extends Omit<IPage, 'root'> {
  root: ISerializedComponent
}

export interface ISerializedComponent extends Omit<IComponent, 'parent' | 'children'> {
  parentId?: string
  children?: ISerializedComponent[]
}
