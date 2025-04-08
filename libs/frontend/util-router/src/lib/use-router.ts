import { inject } from 'vue'
import { IRouter } from './i-router'
import { RouterSymbol } from './router-injection-keys'

export const useRouter = <M = unknown>(): IRouter<M> => {
  const router = inject<IRouter<M>>(RouterSymbol)

  if (!router) {
    throw new Error('No router. Register with `app.use(router)` before `useRouter()`')
  }

  return router
}
