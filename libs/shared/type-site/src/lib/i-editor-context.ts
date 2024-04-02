import { EditorView } from 'prosemirror-view'
import { ContactFormWalkthroughState } from './enum-contact-form-state'
import { CssPseudoClass } from './enum-css-pseudo-class'
import { CssUnit } from './enum-css-unit'
import { IBehavior, IComponent, IComponentEvent } from './i-component'
import { ISerializedComponent } from './i-serialized-site'
import { ISiteStore } from './i-site-store'

export enum EditorMode {
  None = 'none',
  SelectedComponent = 'selC',
  Styles = 'styles',
  Theme = 'theme',
  Page = 'page',
}

export enum BuildSubmenu {
  Asset = 'asset',
  New = 'new',
  File = 'file',
  Page = 'page',
  Behavior = 'behavior',
  History = 'history',
}

export enum ComponentMenuCollapsible {
  Dimensions = 'dimensions',
  Styles = 'styles',
  ChildStyles = 'childStyles',
}

export enum EditorDropdown {
  BackgroundColor = 'bgColor',
  TextColor = 'textColor',
  FontFamily = 'fontFamily',
  FontWeight = 'fontWeight',
  Page = 'page',
  PseudoClass = 'pseudoClass',
  Version = 'version',
  Preview = 'preview',
}

export enum ThemeTab {
  Variables = 'variables',
  Fonts = 'fonts',
  Meta = 'meta',
}

export enum ComponentTabState {
  EditEvent = 'editEvent',
  EditInput = 'editInput',
  EditStyle = 'editStyle',
  EditName = 'editName',
  EditContent = 'editContent',
}

export enum EditorEventName {
  OnPageChange = 'OnPageChange',
  OnIsInputChange = 'OnIsInputChange',
  OnSelfAdded = 'OnSelfAdded',
}

export interface IEditorEvent extends Omit<IComponentEvent, 'eventParams'> {}
export type IComponentEditorEvents = {
  [key in EditorEventName]?: IEditorEvent
}

export type IEditorEvents = Record<string, IComponentEditorEvents>

export interface IEditBehavior extends Omit<IBehavior, 'id'> {
  id?: string
}

export interface IEditSvg {
  content: string
}

export interface IContactFormWalkthrough {
  state: ContactFormWalkthroughState
  formId: string
}

export interface IResizeData {
  component: IComponent
  // Used to determine if width prop should be removed from style during undo
  hasWidthProp: boolean
  // Used to determine if height prop should be removed from style during undo
  hasHeightProp: boolean
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  widthUnit: CssUnit
  heightUnit: CssUnit
  firstMove: boolean
  side: string
  widthPxPerPercent: number
  heightPxPerPercent: number
}

export interface IEditingMixinData {
  mixinId: string
  // The ID of the component the mixin menu was opened from
  originComponentId?: string
}

export interface IEditorContext {
  // Reference to store used to save/restore the site, populated on initialization
  store?: ISiteStore
  copiedComponent?: ISerializedComponent
  hoveredComponent?: IComponent
  selectedComponent?: IComponent
  // ProseMirror EditView object
  editView?: EditorView
  resizeData?: IResizeData
  // Active page route
  active: string
  // Editor events bound to components that trigger behaviors
  editorEvents: IEditorEvents
  // Show component bounding boxes
  debugBounding: boolean
  // Determines active menu
  mode: EditorMode
  // Active Build submenu
  buildSubmenu?: BuildSubmenu
  // Editor active dropdown menu
  editorDropdown?: EditorDropdown
  // Saved state of behavior edit modal
  editBehavior?: IEditBehavior
  // Saved state of SVG edit modal
  editSvg?: IEditSvg
  // Toggle translations modal
  translations?: boolean
  // Active theme tab
  themeTab?: ThemeTab
  componentTab: {
    // Internal tab state
    state?: ComponentTabState
    // Name of editing event
    editEvent?: string
    // Name of editing input
    editInput?: string
    // Name of editing input value
    editInputValue?: string
    // Name of editing info value
    editInfo?: string
  }
  // true if the collapsible is collapsed, otherwise expanded.
  componentMenuCollapses: {
    [key in ComponentMenuCollapsible]?: boolean
  }
  showComponentTree: boolean
  // Record of expanded components in the component tree
  componentTreeExpandedItems: Record<string, boolean>
  // Record of components hidden in the editor
  componentsHidden: Record<string, boolean>
  // Ids of theme variables (colors) to show in color picker
  selectedThemeColors: Set<string>
  // Id of the mixin being edited
  editingMixinData?: IEditingMixinData
  // Set to actual builder window size on page load
  builderWidth: number
  // Defaults to 1
  builderScale: number
  // Active pseudo class
  cssPseudoClass: CssPseudoClass
  // If false/undefined, template selector is shown when the site is loaded
  templatesShown?: boolean
  // State of contact form walkthrough modal
  contactFormWalkthrough?: IContactFormWalkthrough
}
