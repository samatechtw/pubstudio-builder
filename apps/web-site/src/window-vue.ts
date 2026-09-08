import * as Vue from 'vue'

declare global {
  interface Window {
    Vue: unknown
  }
}

// Share the host runtime with external bundles, including compiler-generated helpers.
// A hand-maintained subset can work in the editor but fail on published pages.
window.Vue = Vue
