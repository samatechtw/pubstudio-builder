import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'
import {
  isCustomComponentPart,
  overrideSelectorIds,
  renderChildren,
} from './custom-component'

// Minimal hand-built context: expansion only needs `components` and the registry
const makeContext = (roots: IComponent[], customIds: string[]): ISiteContext => {
  const components: Record<string, IComponent> = {}
  const index = (component: IComponent) => {
    components[component.id] = component
    component.children?.forEach((child) => {
      child.parent = component
      index(child)
    })
  }
  roots.forEach(index)
  return {
    namespace: 'test',
    nextId: 100,
    components,
    globalStyles: {},
    styles: {},
    styleOrder: [],
    customComponentIds: new Set(customIds),
    behaviors: {},
    theme: { variables: {}, fonts: {} },
    breakpoints: {},
    i18n: {},
  }
}

const node = (id: string, fields: Partial<IComponent> = {}): IComponent => ({
  id,
  name: id,
  tag: 'div',
  style: { custom: {} },
  ...fields,
})

describe('custom component expansion', () => {
  it('expands definition children with synthesized identity', () => {
    const definition = node('def', {
      children: [node('defChild', { content: 'from definition' })],
    })
    const instance = node('inst', { customSourceId: 'def' })
    const context = makeContext([definition, instance], ['def'])

    const [child] = renderChildren(context, instance) as IComponent[]
    expect(child.id).toEqual('inst_defChild')
    expect(child.customSourceId).toEqual('defChild')
    expect(child.parent?.id).toEqual('inst')
    // Content is inherited through customSourceId, not copied
    expect(child.content).toBeUndefined()
  })

  it('applies instance overrides by definition child id', () => {
    const definition = node('def', {
      children: [node('defChild', { content: 'from definition' })],
    })
    const instance = node('inst', {
      customSourceId: 'def',
      instanceOverrides: { defChild: { content: 'overridden' } },
    })
    const context = makeContext([definition, instance], ['def'])

    const [child] = renderChildren(context, instance) as IComponent[]
    expect(child.content).toEqual('overridden')
  })

  it('expands nested definitions and keeps their shared style class', () => {
    const inner = node('inner', { children: [node('innerChild')] })
    const outer = node('outer', {
      children: [node('nested', { customSourceId: 'inner' })],
    })
    const instance = node('inst', { customSourceId: 'outer' })
    const context = makeContext([inner, outer, instance], ['inner', 'outer'])

    const [nested] = renderChildren(context, instance) as IComponent[]
    expect(nested.id).toEqual('inst_nested')
    expect(nested.style.mixins).toEqual(['inner'])
    expect(nested.children?.[0].id).toEqual('inst_nested_innerChild')
    expect(nested.children?.[0].customSourceId).toEqual('innerChild')
  })

  it('stops expanding a definition that instantiates itself', () => {
    const definition = node('def', {
      children: [node('selfInstance', { customSourceId: 'def' })],
    })
    const instance = node('inst', { customSourceId: 'def' })
    const context = makeContext([definition, instance], ['def'])

    const [child] = renderChildren(context, instance) as IComponent[]
    expect(child.id).toEqual('inst_selfInstance')
    expect(child.children).toBeUndefined()
  })

  it('prefers real children over expansion', () => {
    const definition = node('def', { children: [node('defChild')] })
    const instance = node('inst', {
      customSourceId: 'def',
      children: [node('own')],
    })
    const context = makeContext([definition, instance], ['def'])

    expect((renderChildren(context, instance) as IComponent[])[0].id).toEqual('own')
  })

  it('offers the whole expansion as override selectors, own children otherwise', () => {
    const definition = node('def', {
      children: [node('a', { children: [node('aChild')] }), node('b')],
    })
    const instance = node('inst', { customSourceId: 'def' })
    const context = makeContext([definition, instance], ['def'])

    expect(overrideSelectorIds(context, instance)).toEqual(['a', 'aChild', 'b'])
    expect(overrideSelectorIds(context, definition)).toEqual(['a', 'b'])
  })

  it('derives definition membership from the parent chain', () => {
    const definition = node('def', {
      children: [node('deep', { children: [node('deeper')] })],
    })
    const instance = node('inst', { customSourceId: 'def' })
    const context = makeContext([definition, instance], ['def'])

    expect(isCustomComponentPart(context, context.components['deeper'])).toBe(true)
    expect(isCustomComponentPart(context, instance)).toBe(false)
  })
})
