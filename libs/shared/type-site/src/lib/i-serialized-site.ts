import { IBreakpoint } from './i-breakpoint'
import { IBehavior, IComponent } from './i-component'
import { IEditorContext } from './i-editor-context'
import { IPage } from './i-page'
import { ISite } from './i-site'
import { ISiteContext, ITranslations } from './i-site-context'
import { IStyle } from './i-style'
import { ITheme } from './i-theme'

// Internal type for serialization
export interface ISerializedSite extends Omit<ISite, 'context' | 'pages' | 'editor'> {
  context: ISerializedSiteContext
  pages: Record<string, ISerializedPage>
  editor?: ISerializedEditorContext
}

export interface ISerializedSiteContext
  extends Omit<ISiteContext, 'components' | 'customComponentIds' | 'customChildIds'> {
  customComponentIds: string[]
  customChildIds: string[]
}

export interface ISerializedEditorContext
  extends Omit<
    IEditorContext,
    'selectedComponent' | 'selectedThemeColors' | 'editorEvents'
  > {
  selectedComponentId?: string
  selectedThemeColors: string[]
}

export interface ISerializedPage extends Omit<IPage, 'root'> {
  root: ISerializedComponent
}

export interface ISerializedComponent extends Omit<IComponent, 'parent' | 'children'> {
  parentId?: string
  children?: ISerializedComponent[]
}

export interface ICopiedComponent {
  siteId: string
  component: ISerializedComponent
  breakpoints: Record<string, IBreakpoint>
  translations: Record<string, ITranslations>
  behaviors: IBehavior[]
  styles: IStyle[]
  theme: ITheme
}
