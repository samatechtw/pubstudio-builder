import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'
import {
  expandedChildId,
  expandedInstanceId,
  isCustomComponentPart,
  isExpandedId,
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

describe('expansion path ids', () => {
  // Collaborative stores suffix generated ids with the tab client id, so a component id
  // contains the same `_` that joins the expansion path
  const instanceId = 'test-c-3_a1b2c3d4e5'
  const childId = 'test-c-7_a1b2c3d4e5'
  const grandchildId = 'test-c-9_a1b2c3d4e5'

  const collaborativeContext = () => {
    const definition = node('test-c-1_a1b2c3d4e5', {
      children: [node(childId, { children: [node(grandchildId)] })],
    })
    const instance = node(instanceId, { customSourceId: definition.id })
    return makeContext([definition, instance], [definition.id])
  }

  it('resolves the instance and definition child of an expanded id', () => {
    const context = collaborativeContext()
    const expandedId = `${instanceId}_${childId}`

    expect(isExpandedId(context, expandedId)).toBe(true)
    expect(expandedInstanceId(context, expandedId)).toEqual(instanceId)
    expect(expandedChildId(context, expandedId)).toEqual(childId)
  })

  it('resolves the deepest definition descendant of a nested expansion', () => {
    const context = collaborativeContext()
    const expandedId = `${instanceId}_${childId}_${grandchildId}`

    expect(expandedInstanceId(context, expandedId)).toEqual(instanceId)
    expect(expandedChildId(context, expandedId)).toEqual(grandchildId)
  })

  it('treats a stored component with a client suffix as a plain id', () => {
    const context = collaborativeContext()

    expect(isExpandedId(context, instanceId)).toBe(false)
    expect(expandedInstanceId(context, instanceId)).toBeUndefined()
    expect(expandedChildId(context, instanceId)).toBeUndefined()
  })

  it('ignores ids that are not an expansion path', () => {
    const context = collaborativeContext()

    expect(isExpandedId(context, '__arena_root')).toBe(false)
    expect(expandedInstanceId(context, `${instanceId}_test-c-404`)).toBeUndefined()
    expect(expandedChildId(context, `${instanceId}_test-c-404`)).toBeUndefined()
  })
})
