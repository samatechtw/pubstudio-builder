import { makeDetachInstanceData } from '@pubstudio/frontend/util-command-data'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { latestComponentId } from '@pubstudio/frontend/util-ids'
import { renderChildren } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent, stringifySite } from '@pubstudio/frontend/util-site-store'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { CommandType } from '@pubstudio/shared/type-command'
import { Css, CssPseudoClass, IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { pushCommand, redoCommand, undoLastCommand } from '../command'
import { setSelectedComponent } from '../set-selected-component'
import { enterComponentEdit, exitComponentEdit } from './component-arena'
import { customComponentIndex } from './custom-component-helpers'

const HOME = '/home'

const add = (site: ISite, parentId: string, fields: Record<string, unknown> = {}) => {
  pushCommand(site, CommandType.AddComponent, { tag: Tag.Div, parentId, ...fields })
  return latestComponentId(site.context)
}

const expandedIds = (site: ISite, component: IComponent): string[] =>
  (renderChildren(site.context, component) ?? []).map((child) => child.id)

describe('custom components', () => {
  let site: ISite
  let root: IComponent
  let sourceId: string
  let childId: string
  let instanceId: string
  let sourceIndex: number

  const convert = (componentId: string) => {
    const component = resolveComponent(site.context, componentId) as IComponent
    pushCommand(site, CommandType.ConvertToCustomComponent, {
      componentId,
      parentId: root.id,
      parentIndex: root.children?.indexOf(component) ?? 0,
    })
    return latestComponentId(site.context)
  }

  beforeEach(() => {
    site = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite
    root = site.pages[HOME].root
    sourceId = add(site, root.id, { name: 'Card' })
    childId = add(site, sourceId, { name: 'CardText', tag: Tag.Span, content: 'hello' })
    sourceIndex = root.children?.findIndex((c) => c.id === sourceId) as number
    instanceId = convert(sourceId)
  })

  it('moves the definition out of the page and leaves an instance', () => {
    const definition = resolveComponent(site.context, sourceId) as IComponent
    expect(site.context.customComponentIds.has(sourceId)).toBe(true)
    expect(definition.parent).toBeUndefined()
    expect(root.children?.some((c) => c.id === sourceId)).toBe(false)

    const instance = resolveComponent(site.context, instanceId) as IComponent
    expect(instance.customSourceId).toEqual(sourceId)
    expect(instance.children).toBeUndefined()
    expect(root.children?.indexOf(instance)).toEqual(sourceIndex)
  })

  it('undoes and redoes the conversion in place', () => {
    undoLastCommand(site)
    expect(site.context.customComponentIds.has(sourceId)).toBe(false)
    expect(root.children?.[sourceIndex]?.id).toEqual(sourceId)
    expect(resolveComponent(site.context, instanceId)).toBeUndefined()

    redoCommand(site)
    expect(site.context.customComponentIds.has(sourceId)).toBe(true)
    expect(root.children?.[sourceIndex]?.id).toEqual(instanceId)
  })

  it('expands definition children under the instance', () => {
    const instance = resolveComponent(site.context, instanceId) as IComponent
    expect(expandedIds(site, instance)).toEqual([`${instanceId}_${childId}`])
    const [expanded] = renderChildren(site.context, instance) as IComponent[]
    expect(expanded.customSourceId).toEqual(childId)
    expect(expanded.parent?.id).toEqual(instanceId)
  })

  it('propagates structural definition edits to every instance', () => {
    const secondId = add(site, sourceId, { name: 'Added later' })
    const instance = resolveComponent(site.context, instanceId) as IComponent
    expect(expandedIds(site, instance)).toEqual([
      `${instanceId}_${childId}`,
      `${instanceId}_${secondId}`,
    ])
  })

  it('serializes definitions outside the pages and restores them', () => {
    const serialized = stringifySite(site)
    const parsed = JSON.parse(serialized)
    expect(parsed.context.customComponents).toHaveLength(1)
    expect(parsed.context.customComponents[0].id).toEqual(sourceId)
    expect(parsed.context.customComponents[0].parentId).toBeUndefined()

    const restored = deserializeSite(serialized) as ISite
    const definition = resolveComponent(restored.context, sourceId) as IComponent
    expect(definition.children?.[0]?.id).toEqual(childId)
    expect(definition.parent).toBeUndefined()
    expect(restored.context.customComponentIds.has(sourceId)).toBe(true)
  })

  describe('removal', () => {
    const remove = (definitionId: string) => {
      const definition = resolveComponent(site.context, definitionId) as IComponent
      pushCommand(site, CommandType.RemoveCustomComponent, {
        componentId: definitionId,
        component: serializeComponent(definition),
        index: customComponentIndex(site, definitionId),
      })
    }

    it('deletes the definition tree and restores it on undo', () => {
      pushCommand(site, CommandType.RemoveComponent, {
        id: instanceId,
        parentId: root.id,
        parentIndex: sourceIndex,
        tag: Tag.Div,
      })
      remove(sourceId)
      expect(site.context.customComponentIds.has(sourceId)).toBe(false)
      expect(resolveComponent(site.context, sourceId)).toBeUndefined()
      expect(resolveComponent(site.context, childId)).toBeUndefined()

      undoLastCommand(site)
      expect(site.context.customComponentIds.has(sourceId)).toBe(true)
      const definition = resolveComponent(site.context, sourceId) as IComponent
      expect(definition.children?.[0]?.id).toEqual(childId)
      expect(definition.children?.[0]?.parent?.id).toEqual(sourceId)
    })

    it('restores registry position on undo', () => {
      const otherId = add(site, root.id, { name: 'Other' })
      convert(otherId)
      expect(Array.from(site.context.customComponentIds)).toEqual([sourceId, otherId])

      pushCommand(site, CommandType.RemoveComponent, {
        id: instanceId,
        parentId: root.id,
        parentIndex: sourceIndex,
        tag: Tag.Div,
      })
      remove(sourceId)
      undoLastCommand(site)
      expect(Array.from(site.context.customComponentIds)).toEqual([sourceId, otherId])
    })
  })

  describe('instance overrides', () => {
    const setOverride = (content: string | undefined) => {
      const instance = resolveComponent(site.context, instanceId) as IComponent
      pushCommand(site, CommandType.SetInstanceOverride, {
        componentId: instanceId,
        childId,
        oldOverride: instance.instanceOverrides?.[childId],
        newOverride: content === undefined ? undefined : { content },
      })
    }

    it('replaces the expanded child content for one instance only', () => {
      const other = add(site, root.id, { customComponentId: sourceId })
      setOverride('overridden')

      const instance = resolveComponent(site.context, instanceId) as IComponent
      const otherInstance = resolveComponent(site.context, other) as IComponent
      expect(renderChildren(site.context, instance)?.[0].content).toEqual('overridden')
      expect(renderChildren(site.context, otherInstance)?.[0].content).toBeUndefined()
    })

    it('clears the entry when the override is removed', () => {
      setOverride('overridden')
      setOverride(undefined)
      const instance = resolveComponent(site.context, instanceId) as IComponent
      expect(instance.instanceOverrides).toBeUndefined()
    })

    it('undoes back to the previous override', () => {
      setOverride('first')
      setOverride('second')
      undoLastCommand(site)
      const instance = resolveComponent(site.context, instanceId) as IComponent
      expect(instance.instanceOverrides?.[childId].content).toEqual('first')
    })
  })

  describe('component edit screen', () => {
    const select = (componentId: string | undefined) =>
      setSelectedComponent(site, resolveComponent(site.context, componentId ?? ''))

    it('mounts the definition in the arena and selects it', () => {
      select(instanceId)
      enterComponentEdit(site, sourceId)

      const definition = resolveComponent(site.context, sourceId) as IComponent
      expect(site.editor?.editingComponentId).toEqual(sourceId)
      expect(definition.parent).toBeDefined()
      expect(site.editor?.selectedComponent?.id).toEqual(sourceId)
    })

    it('restores the selection made before editing', () => {
      select(instanceId)
      enterComponentEdit(site, sourceId)
      exitComponentEdit(site)

      expect(site.editor?.editingComponentId).toBeUndefined()
      expect(site.editor?.selectedComponent?.id).toEqual(instanceId)
    })

    it('clears the selection when the previous component was in a definition', () => {
      select(childId)
      enterComponentEdit(site, sourceId)
      exitComponentEdit(site)

      expect(site.editor?.selectedComponent).toBeUndefined()
    })

    it('clears the selection when the previous component is gone', () => {
      select(instanceId)
      enterComponentEdit(site, sourceId)
      delete site.context.components[instanceId]
      exitComponentEdit(site)

      expect(site.editor?.selectedComponent).toBeUndefined()
    })
  })

  describe('detach', () => {
    beforeEach(() => {
      pushCommand(site, CommandType.SetComponentOverrideStyle, {
        componentId: sourceId,
        selector: childId,
        breakpointId: DEFAULT_BREAKPOINT_ID,
        newStyle: {
          pseudoClass: CssPseudoClass.Default,
          property: Css.Color,
          value: '#ff0000',
        },
      })
    })

    it('replaces the instance with an independent copy', () => {
      const instance = resolveComponent(site.context, instanceId) as IComponent
      const data = makeDetachInstanceData(site, instance)
      pushCommand(site, CommandType.DetachInstance, data)

      expect(resolveComponent(site.context, instanceId)).toBeUndefined()
      const copy = root.children?.[sourceIndex] as IComponent
      expect(copy.customSourceId).toBeUndefined()
      expect(copy.children).toHaveLength(1)
      expect(copy.children?.[0].content).toEqual('hello')
      // Child override style follows the copy's own child id
      expect(Object.keys(copy.style.overrides ?? {})).toEqual([copy.children?.[0].id])
    })

    it('restores the instance on undo', () => {
      const instance = resolveComponent(site.context, instanceId) as IComponent
      const data = makeDetachInstanceData(site, instance)
      pushCommand(site, CommandType.DetachInstance, data)
      undoLastCommand(site)

      const restored = resolveComponent(site.context, instanceId) as IComponent
      expect(restored.customSourceId).toEqual(sourceId)
      expect(root.children?.[sourceIndex]?.id).toEqual(instanceId)
    })
  })
})
