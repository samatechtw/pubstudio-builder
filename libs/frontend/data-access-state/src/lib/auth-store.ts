import { jwtDecode, JwtPayload } from 'jwt-decode'
import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

interface PSJwt extends JwtPayload {
  payload: string
  exp: number
}

export interface IAuthState {
  loginRedirect: string | null
  token: string | null
  expiry: number | null
  userId: string | undefined
}

const getters = (state: IAuthState) => ({
  loginRedirect: () => state.loginRedirect,
  loggedIn: () => !!state.token,
  token: () => state.token,
  expiry: () => state.expiry,
  userId: () => state.userId || undefined,
})

const mutations = (state: IAuthState) => ({
  setLoginRedirect(redirect: string | null): void {
    state.loginRedirect = redirect
  },
  logIn(token: string): void {
    const decoded = jwtDecode<PSJwt>(token)
    state.token = token
    state.expiry = decoded.exp
    state.userId = decoded.sub
  },
  logOut(): void {
    state.token = null
  },
})

export const authModule = useModule<
  IAuthState,
  ReturnType<typeof getters>,
  ReturnType<typeof mutations>
>({
  name: 'auth-store',
  version: 1,
  stateInit: () => ({
    loginRedirect: null,
    token: null,
    expiry: null,
    userId: undefined,
  }),
  getters,
  mutations,
  plugins: [LocalStoragePlugin],
})
