import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { IComponentPosition } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import {
  mockAddComponentData,
  mockMoveComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/web/util-test-mock'
import { applyAddComponent } from '../component/add-component'
import { applyMoveComponent, undoMoveComponent } from './move-component'

describe('Move Component', () => {
  let siteString: string
  let site: ISite
  let containerA: IComponent
  let containerB: IComponent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    const serializedContainerA = mockSerializedComponent(site)
    applyAddComponent(site, mockAddComponentData(serializedContainerA))
    containerA = site.context.components[serializedContainerA.id]

    const serializedContainerB = mockSerializedComponent(site)
    applyAddComponent(site, mockAddComponentData(serializedContainerB))
    containerB = site.context.components[serializedContainerB.id]

    const serializedButtons = [0, 1, 2, 3, 4].map((_, index) => {
      const content = `Button ${index}`
      return mockSerializedComponent(site, {
        tag: Tag.Button,
        parentId: containerA.id,
        content,
      })
    })
    serializedButtons.forEach((serializedButton) => {
      applyAddComponent(site, mockAddComponentData(serializedButton))
    })

    // Collapse all items in component tree
    const { componentTreeExpandedItems = {} } = site.editor ?? {}
    for (const componentId in site.context.components) {
      expect(componentTreeExpandedItems[componentId]).toBeDefined()
      componentTreeExpandedItems[componentId] = false
    }
  })

  describe('reorder component in the same container', () => {
    describe('moves from lower index to higher index', () => {
      it('should move component from index 1 to index 3', () => {
        // Assert button order before move
        const contentBefore = containerA.children?.map((component) => component.content)
        expect(contentBefore).toEqual([
          'Button 0',
          'Button 1',
          'Button 2',
          'Button 3',
          'Button 4',
        ])

        // Move component
        const [fromIndex, toIndex] = [1, 3]

        const from: IComponentPosition = {
          parentId: containerA.id,
          index: fromIndex,
        }
        const to: IComponentPosition = {
          parentId: containerA.id,
          index: toIndex,
        }

        const data = mockMoveComponentData(from, to)
        applyMoveComponent(site, data)

        // Assert button order after move
        const contentAfter = containerA.children?.map((component) => component.content)
        expect(contentAfter).toEqual([
          'Button 0',
          'Button 2',
          'Button 3',
          'Button 1',
          'Button 4',
        ])
      })

      it('should undo move component', () => {
        const contentBefore = containerA.children?.map((component) => component.content)
        expect(contentBefore).toEqual([
          'Button 0',
          'Button 1',
          'Button 2',
          'Button 3',
          'Button 4',
        ])

        // Move component and undo
        const [fromIndex, toIndex] = [1, 3]

        const from: IComponentPosition = {
          parentId: containerA.id,
          index: fromIndex,
        }
        const to: IComponentPosition = {
          parentId: containerA.id,
          index: toIndex,
        }

        const data = mockMoveComponentData(from, to)
        applyMoveComponent(site, data)
        undoMoveComponent(site, data)

        // Assert button order after undo
        const contentAfter = containerA.children?.map((component) => component.content)
        expect(contentAfter).toEqual(contentBefore)
      })
    })

    describe('moves from higher index to lower index', () => {
      it('should move component from index 3 to index 1', () => {
        // Assert button order before move
        const contentBefore = containerA.children?.map((component) => component.content)
        expect(contentBefore).toEqual([
          'Button 0',
          'Button 1',
          'Button 2',
          'Button 3',
          'Button 4',
        ])

        // Move component
        const [fromIndex, toIndex] = [3, 1]

        const from: IComponentPosition = {
          parentId: containerA.id,
          index: fromIndex,
        }
        const to: IComponentPosition = {
          parentId: containerA.id,
          index: toIndex,
        }

        const data = mockMoveComponentData(from, to)
        applyMoveComponent(site, data)

        // Assert button order after move
        const contentAfter = containerA.children?.map((component) => component.content)
        expect(contentAfter).toEqual([
          'Button 0',
          'Button 3',
          'Button 1',
          'Button 2',
          'Button 4',
        ])
      })

      it('should undo move component', () => {
        const contentBefore = containerA.children?.map((component) => component.content)
        expect(contentBefore).toEqual([
          'Button 0',
          'Button 1',
          'Button 2',
          'Button 3',
          'Button 4',
        ])

        // Move component and undo
        const [fromIndex, toIndex] = [3, 1]

        const from: IComponentPosition = {
          parentId: containerA.id,
          index: fromIndex,
        }
        const to: IComponentPosition = {
          parentId: containerA.id,
          index: toIndex,
        }

        const data = mockMoveComponentData(from, to)
        applyMoveComponent(site, data)
        undoMoveComponent(site, data)

        // Assert button order after undo
        const contentAfter = containerA.children?.map((component) => component.content)
        expect(contentAfter).toEqual(contentBefore)
      })
    })
  })

  describe('move component to a different container', () => {
    it('should move component from conatiner A to container B', () => {
      // Assert button order before move
      const contentABefore = containerA.children?.map((component) => component.content)
      expect(contentABefore).toEqual([
        'Button 0',
        'Button 1',
        'Button 2',
        'Button 3',
        'Button 4',
      ])

      const contentBBefore = containerB.children?.map((component) => component.content)
      expect(contentBBefore).toBeUndefined()

      // Move component
      const [fromIndex, toIndex] = [3, 0]
      const from: IComponentPosition = {
        parentId: containerA.id,
        index: fromIndex,
      }
      const to: IComponentPosition = {
        parentId: containerB.id,
        index: toIndex,
      }

      const data = mockMoveComponentData(from, to)
      applyMoveComponent(site, data)

      // Assert button order after move
      const contentAAfter = containerA.children?.map((component) => component.content)
      expect(contentAAfter).toEqual(['Button 0', 'Button 1', 'Button 2', 'Button 4'])

      const contentBAfter = containerB.children?.map((component) => component.content)
      expect(contentBAfter).toEqual(['Button 3'])
    })

    it('should undo move component', () => {
      const contentABefore = containerA.children?.map((component) => component.content)
      expect(contentABefore).toEqual([
        'Button 0',
        'Button 1',
        'Button 2',
        'Button 3',
        'Button 4',
      ])

      const contentBBefore = containerB.children?.map((component) => component.content)
      expect(contentBBefore).toBeUndefined()

      // Move component and undo
      const [fromIndex, toIndex] = [3, 0]
      const from: IComponentPosition = {
        parentId: containerA.id,
        index: fromIndex,
      }
      const to: IComponentPosition = {
        parentId: containerB.id,
        index: toIndex,
      }

      const data = mockMoveComponentData(from, to)
      applyMoveComponent(site, data)
      undoMoveComponent(site, data)

      // Assert button order after undo
      const contentAAfter = containerA.children?.map((component) => component.content)
      expect(contentAAfter).toEqual(contentABefore)

      const contentBAfter = containerB.children?.map((component) => component.content)
      expect(contentBAfter).toEqual([])
    })
  })

  it('should select moved component after move', () => {
    // Unselect component before move
    if (site.editor) {
      site.editor.selectedComponent = undefined
    }

    // Move component
    const [fromIndex, toIndex] = [3, 0]
    const from: IComponentPosition = {
      parentId: containerA.id,
      index: fromIndex,
    }
    const to: IComponentPosition = {
      parentId: containerB.id,
      index: toIndex,
    }
    const movedComponent = site.context.components[from.parentId]?.children?.[from.index]

    const data = mockMoveComponentData(from, to)
    applyMoveComponent(site, data)

    // Assert moved component is selected after move
    expect(site.editor?.selectedComponent).toEqual(movedComponent)
  })

  it('should expand all anecstor items from dropped position in component tree', () => {
    // Assert all items are collapsed before moving component
    const { componentTreeExpandedItems = {} } = site.editor ?? {}
    for (const componentId in site.context.components) {
      expect(componentTreeExpandedItems[componentId]).toEqual(false)
    }

    // Move component
    const [fromIndex, toIndex] = [3, 0]
    const from: IComponentPosition = {
      parentId: containerA.id,
      index: fromIndex,
    }
    const to: IComponentPosition = {
      parentId: containerB.id,
      index: toIndex,
    }
    const movedComponent = site.context.components[from.parentId]?.children?.[from.index]

    const data = mockMoveComponentData(from, to)
    applyMoveComponent(site, data)

    // Assert all ancestor items from dropped position are expanded.
    // Non-ancestor items should remain collapsed.
    const ancestorIds = new Set<string>()
    let ancestor: IComponent | undefined = movedComponent
    while (ancestor) {
      ancestorIds.add(ancestor.id)
      ancestor = ancestor.parent
    }
    for (const componentId in site.context.components) {
      const isAncestor = ancestorIds.has(componentId)
      expect(componentTreeExpandedItems[componentId]).toEqual(isAncestor)
    }
  })
})
