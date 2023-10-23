// Helps determine how the Site is displayed in the Sites Dashboard and builder
export enum SiteVariant {
  // A scratch site that's only saved to localstorage
  Scratch = 'scratch',
  // The user's local/identity site, synced to the Platform API
  Local = 'local',
  // A regular free/paid site, synced to a Site API
  SiteApi = 'siteApi',
}
