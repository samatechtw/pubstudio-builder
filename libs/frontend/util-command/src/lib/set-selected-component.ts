import {
  EditorMode,
  IComponent,
  IEditorContext,
  IPage,
  ISite,
} from '@pubstudio/shared/type-site'
import { nextTick } from 'vue'
import { expandComponentTreeItem } from './component-tree-item-util'
import { componentStylesCancelEdit } from './edit-component-styles-data'
import { setActivePage } from './set-active-page'

export const clearComponentTabState = (editor: IEditorContext | undefined) => {
  if (editor) {
    editor.componentTab.state = undefined
    editor.componentTab.editEvent = undefined
    editor.componentTab.editInput = undefined
    editor.componentTab.editInputValue = undefined
    editor.componentTab.editInfo = undefined
    editor.store?.saveEditor(editor)
  }
}

export interface ISetSelectedComponentOptions {
  /**
   * @default true
   */
  expandTree?: boolean
  /**
   * @default true
   */
  scrollToComponent?: boolean
}

export const setSelectedComponent = (
  site: ISite,
  component: IComponent | undefined,
  options?: ISetSelectedComponentOptions,
) => {
  const { editor } = site

  if (editor) {
    // Remember old state to see if we should save to local storage
    const prevComponent = editor.selectedComponent
    const prevMode = editor.mode

    editor.selectedComponent = component
    const isSelectMode = editor.mode === EditorMode.SelectedComponent
    const { expandTree = true, scrollToComponent = true } = options ?? {}
    if (component) {
      if (!isSelectMode) {
        editor.mode = EditorMode.SelectedComponent
      }
      if (expandTree) {
        expandComponentTreeItem(editor, component)
      }
      // Check for the type of `document` here because unit tests are run in Node environment
      // where `document` is not available. `document !== undefined` is not viable here because
      // that'll lead to "ReferenceError: window is not defined" error in Node environment.
      if (scrollToComponent && typeof document !== 'undefined') {
        // Switch to the target page before scrolling
        const componentPage = findComponentPage(site, component)
        if (!componentPage) {
          throw new Error(`Cannot find page for component with ID ${component.id}`)
        } else if (editor.active !== componentPage.route) {
          setActivePage(editor, componentPage.route)
        }

        // Scroll to the target element. Use `nextTick` to wait for the new component (element)
        // to be inserted to the DOM tree before scrolling.
        nextTick(() => {
          const buildContentWindow = document.getElementById('build-content-window-inner')
          const element = document.getElementById(component.id)
          if (buildContentWindow && element) {
            // Use intersection observer to check if the target element is in the viewport.
            // Only scroll to the target element if it's outside of viewport for better UX.
            const intersectionObserver = new IntersectionObserver(
              // The callback of intersection observer will be executed immediately after setup.
              ([entry]) => {
                if (!entry.intersectionRatio) {
                  element.scrollIntoView()
                }
                intersectionObserver.disconnect()
              },
              {
                root: buildContentWindow,
              },
            )
            intersectionObserver.observe(element)
          }
        })
      }
    } else if (isSelectMode) {
      editor.mode = EditorMode.None
    }
    // Save editor state to local storage if anything changed
    if (editor.mode !== prevMode || component !== prevComponent) {
      componentStylesCancelEdit(site)
      clearComponentTabState(editor)
    }
  }
}

const findComponentPage = (site: ISite, component: IComponent): IPage | undefined => {
  let root = component
  while (root.parent) {
    root = root.parent
  }
  return Object.values(site.pages).find((page) => page.root.id === root.id)
}
