import { EditorView } from 'prosemirror-view'
import { CssPseudoClassType } from './enum-css-pseudo-class'
import { CssUnit } from './enum-css-unit'
import {
  ContactFormWalkthroughState,
  MailingListWalkthroughState,
} from './enum-walkthrough-state'
import { IBehavior, IComponent, IComponentEvent } from './i-component'
import { IHotkeys } from './i-hotkeys'
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
  Custom = 'custom',
  File = 'file',
  Page = 'page',
  Behavior = 'behavior',
  History = 'history',
}

export enum ComponentMenuCollapsible {
  Dimensions = 'dimensions',
  Styles = 'styles',
  ChildStyles = 'childStyles',
  State = 'state',
}

export enum EditorDropdown {
  BackgroundColor = 'bgColor',
  TextColor = 'textColor',
  FontFamily = 'fontFamily',
  FontWeight = 'fontWeight',
  Page = 'page',
  PseudoClass = 'pseudoClass',
  ActiveLanguage = 'editorI18n',
  Version = 'version',
  Preview = 'preview',
}

export enum ThemeTab {
  Variables = 'variables',
  Fonts = 'fonts',
  Meta = 'meta',
}

export enum StyleTab {
  Reusable = 'reusable',
  Global = 'global',
}

export enum ComponentTabState {
  EditEvent = 'editEvent',
  EditInput = 'editInput',
  EditStyle = 'editStyle',
  EditName = 'editName',
  EditContent = 'editContent',
}

export enum EditorEventName {
  OnPageAdd = 'OnPageAdd',
  OnPageRemove = 'OnPageRemove',
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

export interface IEditGlobalStyle {
  oldName: string | undefined
  newName: string
  style: string
}

export interface IContactFormWalkthrough {
  state: ContactFormWalkthroughState
  formId: string
}

export interface IMailingListWalkthrough {
  state: MailingListWalkthroughState
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

export interface IComponentTreeRenameData {
  itemId: string | undefined
  renaming: boolean
}

export interface IEditorPreferences {
  // Show component bounding boxes
  debugBounding: boolean
  // Force opacity to 1
  overrideOpacity?: boolean
  // Force transform to default/initial
  overrideTransform?: boolean
  selectedComponentOutlineColor?: string
  componentMenuHover?: boolean
  componentHover?: boolean
  componentHoverColor?: string
}

export interface IEditorContext {
  // Reference to store used to save/restore the site, populated on initialization
  store?: ISiteStore
  hoveredComponent?: IComponent
  selectedComponent?: IComponent
  // ProseMirror EditView object
  editView?: EditorView
  resizeData?: IResizeData
  // Active page route
  active: string
  // Editor events bound to components that trigger behaviors
  editorEvents: IEditorEvents
  // Determines active menu
  mode: EditorMode
  // Active editing page route
  editPageRoute?: string
  // Active Build submenu
  buildSubmenu?: BuildSubmenu
  // Editor active dropdown menu
  editorDropdown?: EditorDropdown
  // Saved state of behavior edit modal
  editBehavior?: IEditBehavior
  // Selected table name in custom data modal
  selectedTable?: string
  // Saved state of SVG edit modal
  editSvg?: IEditSvg
  // Toggle translations modal
  translations?: boolean
  // Active theme tab
  themeTab?: ThemeTab
  // Active style tab
  styleTab?: StyleTab
  // Editing data for global style
  editGlobalStyle?: IEditGlobalStyle
  componentTab: {
    // Internal tab state
    state?: ComponentTabState
    // Name of editing event
    editEvent?: string
    // Name of editing editor event
    editEditorEvent?: EditorEventName
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
  // Rename component in tree data
  componentTreeRenameData: IComponentTreeRenameData
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
  cssPseudoClass: CssPseudoClassType
  // Active site language
  editorI18n?: string
  // Custom hotkey map
  hotkeys: IHotkeys
  // General preferences
  prefs: IEditorPreferences
  // If false/undefined, template selector is shown when the site is loaded
  templatesShown?: boolean
  // State of contact form walkthrough modal
  contactFormWalkthrough?: IContactFormWalkthrough
  // State of mailing list walkthrough modal
  mailingListWalkthrough?: IMailingListWalkthrough
}
