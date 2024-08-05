// Helpers for managing site updated timestamps in local storage.
// The normal store API is bypassed since the site may be updated in a separate tab,
// so local storage needs to be checked each time the timestamps are queried

const CONTENT_UPDATED_AT_KEY = '__localContentUpdatedAt'

export const setLocalContentUpdatedAt = (
  newContentUpdatedAt: number | undefined | null,
) => {
  localStorage.setItem(CONTENT_UPDATED_AT_KEY, newContentUpdatedAt?.toString() ?? '')
}

// Return true if there is a newer site in local storage
export const checkSiteNeedsUpdate = (
  currentTime: number | undefined,
): number | undefined => {
  const storedTimeStr = localStorage.getItem(CONTENT_UPDATED_AT_KEY) ?? ''
  if (storedTimeStr) {
    const storedTime = parseInt(storedTimeStr)
    if (!isNaN(storedTime)) {
      // If the current site doesn't have a content_updated_at timestamp, we should refresh
      if (!currentTime || storedTime > currentTime) {
        return storedTime
      }
    }
  }
  return undefined
}
