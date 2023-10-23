import type { InjectionKey } from 'vue'
import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { PSApi } from '@pubstudio/frontend/util-api'

export const ApiInjectionKey = Symbol() as InjectionKey<PSApi>
export const StoreInjectionKey = Symbol() as InjectionKey<IFrontendStore>
