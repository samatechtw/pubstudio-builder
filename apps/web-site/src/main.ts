import { createHead } from '@unhead/vue'
import { createApp } from 'vue'
import App from './app/App.vue'
import router from './app/router'

const app = createApp(App)
const head = createHead()
app.use(head)
app.use(router).mount('#app')
