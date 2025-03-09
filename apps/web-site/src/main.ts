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
  isRef,
  markRaw,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
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
  toRef,
  toRefs,
  Transition,
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
  isRef,
  markRaw,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
  openBlock,
  popScopeId,
  provide,
  pushScopeId,
  reactive,
  ref,
  renderList,
  renderSlot,
  resolveComponent,
  Transition,
  toDisplayString,
  toRef,
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
app.use(router).mount('#app')
