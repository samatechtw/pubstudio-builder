import {
  computeLocationParts,
  getCurrentPath,
  IRouter,
  IRouteWithPathRegex,
} from '@pubstudio/frontend/util-router'
import { IPage, ISite } from '@pubstudio/shared/type-site'
import { defineComponent } from 'vue'

export const setupRoutes = (
  router: IRouter<unknown>,
  userSite: ISite,
  PageContent: ReturnType<typeof defineComponent>,
) => {
  let homePageName = ''

  const pageMap = new Map<string, IPage>()

  Object.values(userSite.pages).forEach((page) => {
    if (userSite.defaults.homePage === page.route) {
      homePageName = page.name
    }

    if (page.route === '/not-found') {
      router.overwriteRouteComponent('NotFound', PageContent)
    } else {
      router.addRoute({
        path: page.route,
        name: page.name,
        component: PageContent,
      })
    }

    pageMap.set(page.route, page)
  })

  const { pathname } = window.location
  const currentPage = pageMap.get(pathname)
  const currentPath = getCurrentPath()

  if (currentPage) {
    const route = router.findRouteByName(currentPage.name) as IRouteWithPathRegex<unknown>
    const locationParts = computeLocationParts(route, currentPath)
    router.replace({
      name: currentPage.name,
      ...locationParts,
    })
  } else if (pathname === '/') {
    // Automatically navigate users to default page if current route is '/'
    const homeRoute = router.findRouteByName(homePageName) as IRouteWithPathRegex<unknown>
    const locationParts = computeLocationParts(homeRoute, currentPath)
    router.replace({
      name: homePageName,
      ...locationParts,
    })
  } else {
    router.replace({
      path: currentPath,
    })
  }
}
