import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'
import { defineComponent, h, PropType, Ref, shallowRef, toRefs, VNode } from 'vue'
import { computeInputs } from './compute-inputs'

const checkComponentsLoaded = () => {
  const components = runtimeContext.loadVueComponent.loadedComponents
  let loadComplete = true
  for (const [componentName, componentRef] of Object.entries(components)) {
    if (!componentRef.value) {
      const windowComponent = window[componentName as keyof Window]
      if (windowComponent) {
        componentRef.value = windowComponent
      } else {
        loadComplete = false
      }
    }
  }
  runtimeContext.loadVueComponent.retries += 1
  if (loadComplete || runtimeContext.loadVueComponent.retries > 20) {
    clearInterval(runtimeContext.loadVueComponent.loadComponentTimer)
  }
}

const getOrWaitComponent = (
  componentName: string,
  componentRef: Ref<VNode | undefined>,
) => {
  runtimeContext.loadVueComponent.loadedComponents[componentName] = componentRef
  if (window[componentName as keyof Window]) {
    componentRef.value = window[componentName as keyof Window]
    return
  }
  if (!runtimeContext.loadVueComponent.loadComponentTimer) {
    runtimeContext.loadVueComponent.loadComponentTimer = setInterval(
      checkComponentsLoaded,
      400,
    )
  }
}

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
    const { componentName, customProps } = toRefs(props)
    const component: Ref<VNode | undefined> = shallowRef()

    getOrWaitComponent(componentName.value, component)

    return () => {
      if (component.value) {
        return h(component.value, customProps.value)
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
