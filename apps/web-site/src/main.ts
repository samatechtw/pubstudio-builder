import * as Vue from 'vue'
import { createHead } from '@unhead/vue'
import App from './app/App.vue'
import router from './app/router'

declare global {
  interface Window {
    Vue: unknown
  }
}

window.Vue = Vue

const app = Vue.createApp(App)
const head = createHead()
app.use(head)
app.use(router).mount('#app')
