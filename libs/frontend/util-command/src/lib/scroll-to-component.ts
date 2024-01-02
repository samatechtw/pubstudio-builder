import { IComponent, IPage, ISite } from '@pubstudio/shared/type-site'
import { nextTick } from 'vue'
import { getComponentTreeItemId } from './editor-helpers'
import { setActivePage } from './set-active-page'

// Switch to the corresponding page and scroll to the given component.
export const scrollToComponent = (site: ISite, component: IComponent) => {
  const { editor } = site

  // Check for the type of `document` here because unit tests are run in Node environment
  // where `document` is not available. `document !== undefined` is not viable here because
  // that'll lead to "ReferenceError: window is not defined" error in Node environment.
  if (editor && typeof document !== 'undefined') {
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
}

export const scrollToComponentTreeItem = (component: IComponent) => {
  const treeItemId = getComponentTreeItemId(component)
  const treeItemElement = document.getElementById(treeItemId)
  treeItemElement?.scrollIntoView()
}

const findComponentPage = (site: ISite, component: IComponent): IPage | undefined => {
  let root = component
  while (root.parent) {
    root = root.parent
  }
  return Object.values(site.pages).find((page) => page.root.id === root.id)
}
