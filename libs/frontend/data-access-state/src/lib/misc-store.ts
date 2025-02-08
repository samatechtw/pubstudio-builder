// Miscellaneous app state
// This store includes any state used for app control flow or state that
// doesn't fit in to an obvious category
import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

export interface IMiscState {
  cookiesAccepted: boolean
  scratchPopupViewed: boolean
  showSignup: boolean
  signupListEmail: string | null
  locale: string
}

const getters = (state: IMiscState) => ({
  cookiesAccepted: () => state.cookiesAccepted,
  showSignup: () => state.showSignup,
})

const mutations = (state: IMiscState) => ({
  setCookiesAccepted(accepted: boolean) {
    state.cookiesAccepted = accepted
  },
  setScratchPopupViewed(viewed: boolean) {
    state.scratchPopupViewed = viewed
  },
  setShowSignup: (show: boolean) => {
    state.showSignup = show
  },
  setSignupListEmail: (email: string) => {
    state.signupListEmail = email
  },
  setLocale: (locale: string) => {
    state.locale = locale
  },
})

export const miscModule = useModule<
  IMiscState,
  ReturnType<typeof getters>,
  ReturnType<typeof mutations>
>({
  name: 'misc-store',
  version: 5,
  stateInit: () => ({
    cookiesAccepted: false,
    scratchPopupViewed: false,
    showSignup: false,
    signupListEmail: null,
    locale: 'en',
  }),
  getters,
  mutations,
  plugins: [LocalStoragePlugin],
})
