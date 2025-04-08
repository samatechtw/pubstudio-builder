import {
  AnyComponent,
  createRouter,
  ICreateRouterOptions,
  IDefaultRouteType,
  IRouter,
} from '@pubstudio/frontend/util-router'

let siteRouter: IRouter<IDefaultRouteType>

export const setSiteRouter = (
  notFound: AnyComponent,
  options?: Partial<ICreateRouterOptions<IDefaultRouteType>>,
) => {
  siteRouter = createRouter({
    scrollRoot: '.app',
    defaultScrollType: 'pollHeight',
    scrollBehavior(to, from, savedPosition) {
      if (to?.hash) {
        return { el: to.hash }
      }
      if (savedPosition) {
        return savedPosition
      }
      if (to?.meta?.noScroll && from?.meta?.noScroll) {
        return {}
      }
      return { top: 0 }
    },
    routes: [
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: notFound,
        isNotFoundRoute: true,
      },
    ],
    ...options,
  })
  return siteRouter
}

export const getSiteRouter = (): IRouter<unknown> => {
  return siteRouter as IRouter<unknown>
}
