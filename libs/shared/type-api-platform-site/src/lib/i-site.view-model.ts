import {
  ICustomDomainRelationViewModel,
  SiteCheckoutState,
} from '@pubstudio/shared/type-api-shared'
import { SitePaymentPeriod } from './enum-site-payment-period'
import { SiteType } from './enum-site-type'

export interface ISiteServerRelationViewModel {
  id: string
  address: string
  ip_address: string
}

export interface ISiteCheckoutRelationViewModel {
  id: string
  payment_period: SitePaymentPeriod
  state: SiteCheckoutState
}

export interface ISiteViewModel {
  id: string
  name: string
  site_version: string
  owner_id: string
  site_type: SiteType
  published: boolean
  disabled: boolean
  subdomain: string
  site_server: ISiteServerRelationViewModel
  checkout?: ISiteCheckoutRelationViewModel
  custom_domains: ICustomDomainRelationViewModel[]
  created_at: Date
  updated_at: Date
}
