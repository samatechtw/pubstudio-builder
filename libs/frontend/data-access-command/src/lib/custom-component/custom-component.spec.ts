import {
  makeAddInstanceData,
  makeDetachInstanceData,
  makeRemoveComponentData,
} from '@pubstudio/frontend/util-command-data'
import { canBecomeCustom } from '@pubstudio/frontend/util-component'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { latestComponentId } from '@pubstudio/frontend/util-ids'
import { isArenaId, renderChildren } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent, stringifySite } from '@pubstudio/frontend/util-site-store'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { CommandType } from '@pubstudio/shared/type-command'
import { IAddComponentData, IAddPageData } from '@pubstudio/shared/type-command-data'
import { Css, CssPseudoClass, IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { applyCommand } from '../apply-command'
import { pushAppliedGroup, pushCommand, redoCommand, undoLastCommand } from '../command'
import { createSite } from '../create-site'
import { replaceLastCommand } from '../replace-last-command'
import { setSelectedComponent } from '../set-selected-component'
import {
  ARENA_ROOT_ID,
  ARENA_SLOT_ID,
  enterComponentEdit,
  exitComponentEdit,
} from './component-arena'
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

    it('clears the arena when conversion is undone from the edit screen', () => {
      enterComponentEdit(site, sourceId)

      undoLastCommand(site)

      expect(site.editor?.editingComponentId).toBeUndefined()
      expect(site.context.components[ARENA_ROOT_ID]).toBeUndefined()
      expect(site.editor?.componentArenas?.[sourceId]).toBeUndefined()
      expect(site.context.customComponentIds.has(sourceId)).toBe(false)
      expect(site.context.components[sourceId].parent?.id).toEqual(root.id)
      expect(
        root.children?.filter((component) => component.id === sourceId),
      ).toHaveLength(1)
    })

    it('clears the arena when the open definition is deleted', () => {
      pushCommand(
        site,
        CommandType.RemoveComponent,
        makeRemoveComponentData(site, site.context.components[instanceId]),
      )
      enterComponentEdit(site, sourceId)
      const definition = site.context.components[sourceId]

      pushCommand(site, CommandType.RemoveCustomComponent, {
        componentId: sourceId,
        component: serializeComponent(definition),
        index: customComponentIndex(site, sourceId),
      })

      expect(site.editor?.editingComponentId).toBeUndefined()
      expect(site.context.components[ARENA_ROOT_ID]).toBeUndefined()
      expect(site.context.components[sourceId]).toBeUndefined()
      expect(site.editor?.componentArenas?.[sourceId]).toBeUndefined()

      undoLastCommand(site)
      expect(site.context.components[sourceId].parent).toBeUndefined()
      expect(site.editor?.componentArenas?.[sourceId]).toBeDefined()
    })
  })

  describe('arena scaffolding', () => {
    const arenaRoot = () => site.context.components[ARENA_ROOT_ID] as IComponent

    beforeEach(() => {
      enterComponentEdit(site, sourceId)
    })

    it('numbers scaffolding outside the site id sequence', () => {
      const nextId = site.context.nextId
      add(site, arenaRoot().id, { name: 'Backdrop' })

      expect(isArenaId(arenaRoot().children?.[1]?.id)).toBe(true)
      expect(site.context.nextId).toEqual(nextId)
    })

    it('does not confuse a site named arena with editor scaffolding', () => {
      const arenaSite = createSite('arena')
      const pageRoot = arenaSite.pages[HOME].root
      pushCommand(arenaSite, CommandType.AddComponent, {
        tag: Tag.Div,
        parentId: pageRoot.id,
      })
      const component = pageRoot.children?.[0] as IComponent

      expect(component.id).toMatch(/^arena-c-/)
      expect(isArenaId(component.id)).toBe(false)
      expect(canBecomeCustom(arenaSite.context, component.id)).toBe(true)
    })

    it('keeps scaffolding edits out of site history', () => {
      const depth = site.history.back.length
      add(site, arenaRoot().id, { name: 'Backdrop' })
      pushCommand(site, CommandType.SetComponentCustomStyle, {
        componentId: arenaRoot().children?.[1]?.id,
        breakpointId: DEFAULT_BREAKPOINT_ID,
        oldStyle: undefined,
        newStyle: {
          pseudoClass: CssPseudoClass.Default,
          property: Css.Width,
          value: '1px',
        },
      })

      expect(site.history.back.length).toEqual(depth)
    })

    it('keeps a scaffolding detach out of site history', () => {
      const depth = site.history.back.length
      pushCommand(site, CommandType.AddComponent, {
        tag: Tag.Div,
        parentId: arenaRoot().id,
        customComponentId: sourceId,
      })
      const instance = arenaRoot().children?.find(
        (component) => component.customSourceId === sourceId,
      ) as IComponent
      pushCommand(
        site,
        CommandType.DetachInstance,
        makeDetachInstanceData(site, instance),
      )
      const detachedId = arenaRoot().children?.find(
        (component) => component.id !== sourceId,
      )?.id

      expect(site.history.back.length).toEqual(depth)
      exitComponentEdit(site)
      expect(site.context.components[instance.id]).toBeUndefined()
      expect(site.context.components[detachedId as string]).toBeUndefined()
    })

    it('records only site commands from a mixed group', () => {
      add(site, arenaRoot().id, { name: 'Backdrop' })
      const scaffold = arenaRoot().children?.find(
        (component) => component.id !== sourceId,
      ) as IComponent
      const depth = site.history.back.length
      const oldName = root.name
      pushCommand(site, CommandType.Group, {
        commands: [
          {
            type: CommandType.EditComponent,
            data: { id: root.id, old: { name: oldName }, new: { name: 'Renamed' } },
          },
          {
            type: CommandType.RemoveComponent,
            data: makeRemoveComponentData(site, scaffold),
          },
        ],
      })

      expect(site.history.back).toHaveLength(depth + 1)
      expect(site.history.back.at(-1)).toMatchObject({
        type: CommandType.Group,
        data: { commands: [{ type: CommandType.EditComponent }] },
      })
      exitComponentEdit(site)
      undoLastCommand(site)
      expect(root.name).toEqual(oldName)
      expect(site.context.components[scaffold.id]).toBeUndefined()
    })

    it('filters a mixed agent batch after its commands were applied', () => {
      add(site, arenaRoot().id, { name: 'Backdrop' })
      const scaffold = arenaRoot().children?.find(
        (component) => component.id !== sourceId,
      ) as IComponent
      const depth = site.history.back.length
      const commands = [
        {
          type: CommandType.EditComponent,
          data: { id: root.id, old: { name: root.name }, new: { name: 'Agent rename' } },
        },
        {
          type: CommandType.RemoveComponent,
          data: makeRemoveComponentData(site, scaffold),
        },
      ]
      commands.forEach((command) => applyCommand(site, command))
      pushAppliedGroup(site, commands, 'mixed arena batch')

      expect(site.history.back).toHaveLength(depth + 1)
      expect(site.history.back.at(-1)).toMatchObject({
        data: { commands: [{ type: CommandType.EditComponent }] },
      })
      exitComponentEdit(site)
      undoLastCommand(site)
      expect(site.context.components[scaffold.id]).toBeUndefined()
    })

    it('filters scaffolding from an agent batch that closes the arena', () => {
      const depth = site.history.back.length
      const scaffoldData: IAddComponentData = {
        tag: Tag.Div,
        parentId: ARENA_ROOT_ID,
      }
      const scaffoldCommand = {
        type: CommandType.AddComponent,
        data: scaffoldData,
      }
      applyCommand(site, scaffoldCommand)
      const scaffoldId = scaffoldData.id as string
      const changePageCommand = {
        type: CommandType.ChangePage,
        data: { from: HOME, to: HOME, selectedComponentId: sourceId },
      }
      applyCommand(site, changePageCommand)
      const pageData: IAddComponentData = { tag: Tag.Div, parentId: root.id }
      const pageCommand = {
        type: CommandType.AddComponent,
        data: pageData,
      }
      applyCommand(site, pageCommand)
      const pageComponentId = pageData.id as string
      const nextId = site.context.nextId

      pushAppliedGroup(
        site,
        [scaffoldCommand, changePageCommand, pageCommand],
        'leave arena batch',
      )

      expect(site.editor?.editingComponentId).toBeUndefined()
      expect(site.context.components[scaffoldId]).toBeUndefined()
      expect(site.history.back).toHaveLength(depth + 1)
      expect(site.history.back.at(-1)).toMatchObject({
        data: {
          commands: [
            { type: CommandType.ChangePage },
            { type: CommandType.AddComponent },
          ],
        },
      })

      undoLastCommand(site)
      redoCommand(site)

      expect(site.context.nextId).toEqual(nextId)
      expect(site.context.components[pageComponentId]).toBeDefined()
      expect(Object.keys(site.context.components).some(isArenaId)).toBe(false)
    })

    it('rejects moving components across the arena boundary', () => {
      const depth = site.history.back.length
      const fromIndex = root.children?.findIndex(
        (component) => component.id === instanceId,
      )
      const moved = pushCommand(site, CommandType.MoveComponent, {
        from: { parentId: root.id, index: fromIndex },
        to: { parentId: arenaRoot().id, index: 0 },
      })

      expect(moved).toBe(false)
      expect(site.history.back).toHaveLength(depth)
      expect(site.context.components[instanceId].parent?.id).toEqual(root.id)
    })

    it('rejects moving an instance inside its definition', () => {
      const fromIndex = root.children?.findIndex(
        (component) => component.id === instanceId,
      ) as number
      const depth = site.history.back.length

      const moved = pushCommand(site, CommandType.MoveComponent, {
        from: { parentId: root.id, index: fromIndex },
        to: { parentId: sourceId, index: 0 },
      })

      expect(moved).toBe(false)
      expect(site.history.back).toHaveLength(depth)
      expect(site.context.components[instanceId].parent?.id).toEqual(root.id)
    })

    it('snapshots replacement edits before saving', () => {
      add(site, arenaRoot().id, { name: 'Backdrop' })
      const scaffold = arenaRoot().children?.find(
        (component) => component.id !== sourceId,
      ) as IComponent
      replaceLastCommand(site, {
        type: CommandType.EditComponent,
        data: {
          id: scaffold.id,
          old: { name: scaffold.name },
          new: { name: 'Renamed backdrop' },
        },
      })

      expect(
        site.editor?.componentArenas?.[sourceId].children?.find(
          (component) => component.id === scaffold.id,
        )?.name,
      ).toEqual('Renamed backdrop')
    })

    it('refuses the builder path for an instance inside its definition', () => {
      const definition = site.context.components[sourceId]

      expect(
        makeAddInstanceData(site, sourceId, definition, definition.id),
      ).toBeUndefined()
    })

    it('allows the builder path when selection rules place the instance outside', () => {
      const definition = site.context.components[sourceId]
      definition.content = 'Card'

      expect(
        makeAddInstanceData(site, sourceId, definition, definition.id)?.parentId,
      ).toEqual(ARENA_ROOT_ID)
    })

    it('records definition edits made in the arena', () => {
      const depth = site.history.back.length
      add(site, sourceId, { name: 'CardBadge' })

      expect(site.history.back.length).toEqual(depth + 1)
    })

    it('discards scaffolding when the screen closes', () => {
      add(site, arenaRoot().id, { name: 'Backdrop' })
      const scaffoldId = arenaRoot().children?.[1]?.id as string
      exitComponentEdit(site)

      expect(site.context.components[scaffoldId]).toBeUndefined()
      expect(site.context.components[ARENA_ROOT_ID]).toBeUndefined()
      expect(site.context.components[sourceId]).toBeDefined()
    })

    it('tears down the arena before adding and switching to a page', () => {
      add(site, arenaRoot().id, { name: 'Backdrop' })
      const data: IAddPageData = {
        metadata: {
          name: 'New Page',
          route: '/new-page',
          public: true,
          head: {},
        },
        activePageRoute: HOME,
        selectedComponentId: sourceId,
      }

      pushCommand(site, CommandType.AddPage, data)

      expect(site.editor?.editingComponentId).toBeUndefined()
      expect(site.context.components[ARENA_ROOT_ID]).toBeUndefined()
      expect(site.context.components[sourceId].parent).toBeUndefined()
      expect(Object.keys(site.context.components).some(isArenaId)).toBe(false)
      expect(site.editor?.active).toEqual('/new-page')
    })

    it('leaves nextId untouched across a reload of a scaffolded arena', () => {
      add(site, arenaRoot().id, { name: 'Backdrop' })
      exitComponentEdit(site)
      const nextId = site.context.nextId

      const reloaded = deserializeSite(stringifySite(site)) as ISite
      const depth = reloaded.history.back.length
      undoLastCommand(reloaded)
      redoCommand(reloaded)

      expect(reloaded.context.nextId).toEqual(nextId)
      expect(reloaded.history.back.length).toEqual(depth)
    })

    it('restores nextId exactly when a created component is already gone', () => {
      exitComponentEdit(site)
      const nextId = site.context.nextId
      const addedId = add(site, root.id, { name: 'Section' })
      delete site.context.components[addedId]

      undoLastCommand(site)

      expect(site.context.nextId).toEqual(nextId)
    })

    it('renumbers an arena stored with site ids', () => {
      exitComponentEdit(site)
      const legacyId = `${site.context.namespace}-c-9999`
      if (site.editor) {
        site.editor.componentArenas = {
          [sourceId]: {
            id: ARENA_ROOT_ID,
            name: 'Arena',
            tag: Tag.Div,
            style: { custom: {} },
            children: [
              { id: legacyId, name: 'Backdrop', tag: Tag.Div, style: { custom: {} } },
              {
                id: ARENA_SLOT_ID,
                name: 'Component',
                tag: Tag.Div,
                style: { custom: {} },
              },
            ],
          },
        }
      }
      enterComponentEdit(site, sourceId)

      expect(site.context.components[legacyId]).toBeUndefined()
      expect(isArenaId(arenaRoot().children?.[0]?.id)).toBe(true)
    })

    it('does not rename definition selectors on legacy arena instances', () => {
      exitComponentEdit(site)
      const legacyInstanceId = `${site.context.namespace}-c-9998`
      if (site.editor) {
        site.editor.componentArenas = {
          [sourceId]: {
            id: 'arena-c-root',
            name: 'Arena',
            tag: Tag.Div,
            style: { custom: {} },
            children: [
              {
                id: childId,
                name: 'Colliding backdrop',
                tag: Tag.Div,
                style: { custom: {} },
              },
              {
                id: legacyInstanceId,
                name: 'Card preview',
                tag: Tag.Div,
                customSourceId: sourceId,
                style: {
                  custom: {},
                  overrides: {
                    [childId]: {
                      [DEFAULT_BREAKPOINT_ID]: {
                        default: { color: '#ff0000' },
                      },
                    },
                  },
                },
              },
              {
                id: 'arena-c-slot',
                name: 'Component',
                tag: Tag.Div,
                style: { custom: {} },
              },
            ],
          },
        }
      }
      enterComponentEdit(site, sourceId)
      const instance = arenaRoot().children?.find(
        (component) => component.customSourceId === sourceId,
      ) as IComponent

      expect(Object.keys(instance.style.overrides ?? {})).toEqual([childId])
      expect(site.context.components[childId].name).toEqual('CardText')
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
