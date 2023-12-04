import { IDatalistOption } from '@pubstudio/frontend/type-ui-widgets'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

export const getLinkDatalistOptions = (
  site: ISite,
  currentComponentId: string,
): IDatalistOption[] => {
  const options: IDatalistOption[] = []

  // Pages
  Object.values(site.pages).forEach((page) => {
    options.push({
      label: page.name,
      value: page.route,
    })
  })

  // Components in the same page
  const findAnchors = (component: IComponent): void => {
    // TODO: only including certain types of components in the list?
    if (component.id !== currentComponentId) {
      options.push({
        label: component.name,
        value: `#${component.id}`,
      })
    }
    component.children?.forEach((child) => findAnchors(child))
  }
  const currentPage = site.pages[site.editor?.active ?? '']
  findAnchors(currentPage.root)

  return options
}
