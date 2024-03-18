import { inject } from 'vue'
import { IRouter } from './i-router'
import { RouterSymbol } from './router-injection-keys'

export const useRouter = <M = unknown>(): IRouter<M> => {
  const router = inject<IRouter<M>>(RouterSymbol)

  if (!router) {
    throw new Error(
      'No router was found. Please register a router with `app.use(router)` before using `useRouter()`',
    )
  }

  return router
}
