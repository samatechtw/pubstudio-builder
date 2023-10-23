import {
  ISiteCheckoutRelationViewModel,
  ISiteServerRelationViewModel,
  ISiteViewModel,
  SiteVariant,
} from '@pubstudio/shared/type-api-platform-site'

// Data representing either a Local or Platform site
export interface IMergedSiteData
  extends Omit<ISiteViewModel, 'owner_id' | 'created_at' | 'updated_at' | 'site_server'> {
  variant: SiteVariant
  created_at?: Date
  updated_at?: Date
  site_server?: ISiteServerRelationViewModel
  checkout?: ISiteCheckoutRelationViewModel
}
