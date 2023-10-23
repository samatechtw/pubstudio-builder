import { inject } from 'vue'
import { IRouter } from './i-router'
import { RouterSymol } from './router-injection-keys'

export const useRouter = <M = unknown>(): IRouter<M> => {
  const router = inject<IRouter<M>>(RouterSymol)

  if (!router) {
    throw new Error(
      'No router was found. Please register a router with `app.use(router)` before using `useRouter()`',
    )
  }

  return router
}
