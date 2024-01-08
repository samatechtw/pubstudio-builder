import { minidenticon } from '@pubstudio/frontend/util-identicon'
import {
  ILocalSiteRelationViewModel,
  UserType,
} from '@pubstudio/shared/type-api-platform-user'
import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

type IdentitySiteState = ILocalSiteRelationViewModel

interface UserState {
  id: string
  email: string
  emailConfirmed: boolean
  userType: string
  userStatus: string
  createdAt: number | null
  identiconAvatar: string | null
  identity: IdentitySiteState
}

const DEFAULT_IDENTITY: IdentitySiteState = {
  id: '',
  name: '',
  published: false,
  subdomain: '',
}

const userInit = (): UserState => ({
  id: '',
  email: '',
  emailConfirmed: false,
  userType: '',
  userStatus: '',
  createdAt: null,
  identiconAvatar: null,
  identity: DEFAULT_IDENTITY,
})

export const userGetters = (state: UserState) => ({
  isAdmin: () => {
    return state.userType === UserType.Admin
  },
})

const userMutations = (user: UserState) => ({
  resetUser: () => {
    Object.assign(user, userInit())
  },
  updateUser: <Key extends keyof UserState>(userData: Pick<UserState, Key>) => {
    Object.assign(user, userData)
  },
  updateIdentity: (identity: Partial<IdentitySiteState>) => {
    user.identity = { ...user.identity, ...identity }
  },
  updateEmail: (email: string) => {
    user.email = email
    user.identiconAvatar = minidenticon(email)
    user.emailConfirmed = false
  },
  setConfirmed: (confirmed: boolean) => {
    user.emailConfirmed = confirmed
  },
})

export const userModule = useModule<
  UserState,
  ReturnType<typeof userGetters>,
  ReturnType<typeof userMutations>
>({
  name: 'user',
  version: 1,
  stateInit: userInit,
  mutations: userMutations,
  getters: userGetters,
  plugins: [LocalStoragePlugin],
})

export type UserModule = typeof userModule
