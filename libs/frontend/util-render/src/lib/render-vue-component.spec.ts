// @vitest-environment happy-dom
import { App, createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import {
  ComponentArgPrimitive,
  IComponent,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { renderVueComponent } from './render-vue-component'

const context = { components: {}, theme: { variables: {} } } as ISiteContext
const globals = window as unknown as Record<string, unknown>
const loaded = defineComponent({
  props: ['label'],
  setup: (props) => () => h('span', props.label ?? 'loaded'),
})
const embed = (name: string, props = {}) =>
  renderVueComponent(
    context,
    {
      id: 'embed',
      name: 'embed',
      tag: 'vue',
      style: { custom: {} },
      inputs: {
        componentName: {
          name: 'componentName',
          type: ComponentArgPrimitive.String,
          default: name,
          is: name,
        },
      },
    } as IComponent,
    props,
  )

let app: App
let root: HTMLDivElement
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  root = document.createElement('div')
  document.body.appendChild(root)
})
afterEach(() => {
  app?.unmount()
  root.remove()
  delete globals.TestEmbed
  delete globals.OtherEmbed
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Vue embeds', () => {
  it('resolves every instance of a bundle that loads late', async () => {
    app = createApp({
      render: () =>
        h('main', [
          embed('TestEmbed', { label: 'one' }),
          embed('TestEmbed', { label: 'two' }),
        ]),
    })
    app.mount(root)
    await nextTick()
    globals.TestEmbed = loaded
    await vi.advanceTimersByTimeAsync(400)
    expect(root.textContent).toBe('onetwo')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps waiting beyond the old timeout and cancels on unmount', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    app = createApp({ render: () => embed('TestEmbed') })
    app.mount(root)
    await nextTick()
    await vi.advanceTimersByTimeAsync(12000)
    expect(warn).toHaveBeenCalledOnce()
    globals.TestEmbed = loaded
    await vi.advanceTimersByTimeAsync(400)
    expect(root.textContent).toBe('loaded')
    app.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('loads changed names and starts new polling after an earlier load completes', async () => {
    const name = ref('TestEmbed')
    app = createApp({ render: () => embed(name.value) })
    app.mount(root)
    await nextTick()
    globals.TestEmbed = loaded
    await vi.advanceTimersByTimeAsync(400)
    expect(root.textContent).toBe('loaded')
    name.value = 'OtherEmbed'
    await nextTick()
    expect(root.textContent).toBe('')
    globals.OtherEmbed = defineComponent({ render: () => h('b', 'other') })
    await vi.advanceTimersByTimeAsync(400)
    expect(root.textContent).toBe('other')
  })

  it('cleans up pending lookups when the name changes or the instance unmounts', async () => {
    const name = ref('TestEmbed')
    app = createApp({ render: () => embed(name.value) })
    app.mount(root)
    await nextTick()
    name.value = 'OtherEmbed'
    await nextTick()
    expect(vi.getTimerCount()).toBe(1)
    app.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('hydrates the placeholder even if the bundle is already available', async () => {
    globals.TestEmbed = loaded
    root.innerHTML = '<div></div>'
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    app = createSSRApp({ render: () => embed('TestEmbed') })
    app.mount(root)
    await nextTick()
    expect(root.textContent).toBe('loaded')
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })
})
