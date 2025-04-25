// Helpers for managing site updates in local storage.
// The normal store API is bypassed since the site may be updated in a separate tab,
// so local storage needs to be checked each time the timestamps are queried
// The site ID is stored separately to quickly verify that a different site hasn't been
// edited/saved since the last time the current preview was viewed

const CONTENT_UPDATED_AT_KEY = '__localContentUpdatedAt'
const LOCAL_SITE_KEY = '__localSiteId'

export const setLocalContentUpdatedAt = (
  id: string,
  newContentUpdatedAt: number | undefined | null,
) => {
  localStorage.setItem(LOCAL_SITE_KEY, id)
  localStorage.setItem(CONTENT_UPDATED_AT_KEY, newContentUpdatedAt?.toString() ?? '')
}

export interface ISiteNeedsUpdateResult {
  storedTime?: number
  forceRefresh: boolean
}

// Return true if there is a newer site in local storage
export const checkSiteNeedsUpdate = (
  siteId: string | undefined,
  currentTime: number | undefined,
): ISiteNeedsUpdateResult => {
  const storedSiteId = localStorage.getItem(LOCAL_SITE_KEY)
  // If a different site was edited last, force an API refresh
  if (siteId && storedSiteId !== siteId) {
    return { forceRefresh: true }
  }
  const storedTimeStr = localStorage.getItem(CONTENT_UPDATED_AT_KEY) ?? ''
  if (storedTimeStr) {
    const storedTime = parseInt(storedTimeStr)
    if (!isNaN(storedTime)) {
      // If the current site doesn't have a content_updated_at timestamp, we should refresh
      if (!currentTime || storedTime > currentTime) {
        return { storedTime, forceRefresh: false }
      }
    }
  }
  return { forceRefresh: false }
}
