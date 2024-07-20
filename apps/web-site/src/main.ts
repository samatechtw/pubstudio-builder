import { createHead } from '@unhead/vue'
import {
  computed,
  createApp,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createElementVNode,
  createTextVNode,
  createVNode,
  defineComponent,
  Fragment,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onMounted,
  onUnmounted,
  openBlock,
  popScopeId,
  pushScopeId,
  reactive,
  ref,
  renderList,
  renderSlot,
  toDisplayString,
  toRefs,
  unref,
  useCssVars,
  vModelText,
  watch,
  withCtx,
  withDirectives,
  withModifiers,
} from 'vue'
import App from './app/App.vue'
import router from './app/router'

declare global {
  interface Window {
    Vue: unknown
  }
}

window.Vue = {
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createElementVNode,
  createTextVNode,
  createVNode,
  defineComponent,
  Fragment,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onMounted,
  onUnmounted,
  openBlock,
  popScopeId,
  pushScopeId,
  reactive,
  ref,
  renderList,
  renderSlot,
  toDisplayString,
  toRefs,
  unref,
  useCssVars,
  vModelText,
  watch,
  withCtx,
  withDirectives,
  withModifiers,
}

const app = createApp(App)
const head = createHead()
app.use(head)
app.use(router).mount('#app')
