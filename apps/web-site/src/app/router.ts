import { createRouter } from '@pubstudio/frontend/util-router'
import NotFound from './components/NotFound.vue'

const router = createRouter({
  scrollRoot: '.app',
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
      component: NotFound,
      isNotFoundRoute: true,
    },
  ],
})

export default router
