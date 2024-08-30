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
  inject,
  markRaw,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onMounted,
  onUnmounted,
  openBlock,
  popScopeId,
  provide,
  pushScopeId,
  reactive,
  ref,
  renderList,
  renderSlot,
  resolveComponent,
  toDisplayString,
  toRefs,
  unref,
  useCssVars,
  vModelText,
  vShow,
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
  createApp,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createElementVNode,
  createTextVNode,
  createVNode,
  defineComponent,
  Fragment,
  inject,
  markRaw,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onMounted,
  onUnmounted,
  openBlock,
  popScopeId,
  provide,
  pushScopeId,
  reactive,
  ref,
  renderList,
  renderSlot,
  resolveComponent,
  toDisplayString,
  toRefs,
  unref,
  useCssVars,
  vModelText,
  vShow,
  watch,
  withCtx,
  withDirectives,
  withModifiers,
}

const app = createApp(App)
const head = createHead()
app.use(head)
app.use(router).mount('#app')
