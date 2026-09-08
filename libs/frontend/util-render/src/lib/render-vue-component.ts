import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'
import {
  Component,
  defineComponent,
  h,
  onMounted,
  PropType,
  shallowRef,
  VNode,
  watch,
} from 'vue'
import { computeInputs } from './compute-inputs'

interface IVueComponentProps {
  componentName: string
  customProps: Record<string, unknown>
}

const VueComponent = defineComponent({
  props: {
    componentName: {
      type: String,
      required: true,
    },
    customProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  },
  setup(props: IVueComponentProps) {
    const component = shallowRef<Component>()
    const mounted = shallowRef(false)

    // Start after mount so SSG and the first hydration render both use the placeholder.
    // Each instance owns its watcher: duplicate names must not overwrite other waiters.
    watch(
      () => (mounted.value ? props.componentName : undefined),
      (name, _oldName, onCleanup) => {
        component.value = undefined
        if (!name || typeof window === 'undefined') return
        const resolve = () => {
          const loaded = (window as unknown as Record<string, Component>)[name]
          if (loaded) component.value = loaded
          return !!loaded
        }
        if (resolve()) return
        let attempts = 0
        const timer = setInterval(() => {
          if (resolve()) {
            clearInterval(timer)
          } else if (++attempts === 20) {
            console.warn(
              `Vue component "${name}" has not registered on window. Check its script URL and exported name.`,
            )
          }
        }, 400)
        onCleanup(() => clearInterval(timer))
      },
      { immediate: false },
    )
    onMounted(() => {
      mounted.value = true
    })

    return () => {
      if (component.value) {
        return h(component.value, props.customProps)
      }
      return h('div', '')
    }
  },
})

export const renderVueComponent = (
  context: ISiteContext,
  component: IComponent,
  renderProps: Record<string, unknown>,
): VNode | undefined => {
  const inputs = computeInputs(
    context,
    component,
    resolveComponent(context, component.customSourceId),
    {},
  )
  const { componentName, ...customInputs } = inputs
  if (!componentName) {
    return h('div', 'Error')
  }

  return h(VueComponent, {
    componentName: componentName as string,
    customProps: { ...customInputs, ...renderProps },
  })
}
