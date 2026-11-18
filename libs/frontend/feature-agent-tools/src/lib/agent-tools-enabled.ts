const STORAGE_KEY = 'pubstudio.agent-tools'

// Enabling is not a security boundary — any script on the builder page already reaches the
// site model and the API token. It keeps an obvious automation entry point off the default
// surface, gives the user a visible signal and a kill switch, and keeps the code out of the
// default bundle.
export const agentToolsEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  const param = new URLSearchParams(window.location.search).get('ai')
  if (param === '1' || param === '0') {
    window.localStorage.setItem(STORAGE_KEY, param)
    return param === '1'
  }
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === null ? import.meta.env.DEV : saved === '1'
}

export const disableAgentTools = () => {
  window.localStorage.setItem(STORAGE_KEY, '0')
}
