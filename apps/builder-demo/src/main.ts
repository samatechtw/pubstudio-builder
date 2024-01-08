import {
  ApiInjectionKey,
  StoreInjectionKey,
} from '@pubstudio/frontend/data-access-injection'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { createApp } from 'vue'
import { rootApi } from './api'
import App from './app/App.vue'
import i18n from './i18n'

const app = createApp(App)

app.provide(ApiInjectionKey, rootApi)
app.provide(StoreInjectionKey, store)

app.use(i18n)
app.mount('#app')
