import { makeRemoveComponentData } from '@pubstudio/frontend/util-command-data'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IReplacePageRootData } from '@pubstudio/shared/type-command-data'
import {
  IComponent,
  IPage,
  ISerializedComponent,
  ISite,
  Tag,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from './add-component'
import { applyReplacePageRoot, undoReplacePageRoot } from './replace-page-root'

describe('Replace Page Root', () => {
  let siteString: string
  let site: ISite
  let page: IPage
  let copiedComponent: IComponent
  let replacePageRootData: IReplacePageRootData

  const computeComponentCount = (component?: IComponent) => {
    if (!component) {
      return Object.keys(site.context.components).length
    }

    let count = 1
    component.children?.forEach((child) => {
      count += computeComponentCount(child)
    })
    return count
  }

  const assertComponentRemoved = (component: ISerializedComponent) => {
    expect(component.id in site.context.components).toEqual(false)
    component.children?.forEach((child) => {
      assertComponentRemoved(child)
    })
  }

  const compareComponent = (
    compA: ISerializedComponent | undefined,
    compB: ISerializedComponent | undefined,
    ignoredProps?: Set<keyof ISerializedComponent>,
  ) => {
    // Make sure compA and compB are either both truthy or both falsy.
    expect(!!compA).toEqual(!!compB)

    if (compA) {
      Object.keys(compA).forEach((key) => {
        const prop = key as keyof ISerializedComponent
        if (ignoredProps?.has(prop)) {
          return
        } else if (key === 'children') {
          // Make sure the children of compA and compB are either both truthy or both falsy.
          expect(!!compA.children).toEqual(!!compB?.children)

          // Recursively compare children.
          compA.children?.forEach((childA, index) => {
            const childB = compB?.children?.[index]
            compareComponent(childA, childB, ignoredProps)
          })
        } else {
          expect(compA[prop]).toEqual(compB?.[prop])
        }
      })
    }
  }

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    page = site.pages['/home']

    // Add the following components to the site:
    // <HorizontalContainer name="copyMe">
    //   <H1>Hello</H1>
    //   <Text>World</Text>
    //   <VerticalContainer>
    //     <Input />
    //   </VerticalContainer>
    // </HorizontalContainer>
    const copiedComponentName = 'copyMe'
    const newComponent = mockSerializedComponent(site, {
      name: copiedComponentName,
      tag: Tag.Div,
      parentId: page.root.id,
      children: [
        mockSerializedComponent(site, {
          name: 'H1',
          tag: Tag.H1,
          content: 'Hello',
        }),
        mockSerializedComponent(site, {
          name: 'Text',
          tag: Tag.Div,
          content: 'World',
        }),
        mockSerializedComponent(site, {
          name: 'VerticalContainer',
          tag: Tag.Div,
          children: [
            mockSerializedComponent(site, {
              name: 'Input',
              tag: Tag.Input,
            }),
          ],
        }),
      ],
    })
    applyAddComponent(site, mockAddComponentData(newComponent))

    // Assign copied component
    const copiedComp = page.root.children?.find(
      (child) => child.name === copiedComponentName,
    )
    if (!copiedComp) {
      throw new Error('Cannot find the component to be copied')
    }
    copiedComponent = copiedComp

    // Prepare replace page root data
    replacePageRootData = {
      pageRoute: page.route,
      oldRoot: makeRemoveComponentData(site, page.root, true),
      replacementComponent: {
        name: copiedComponent.name,
        tag: copiedComponent.tag,
        content: copiedComponent.content,
        sourceId: copiedComponent.id,
        parentId: '',
      },
    }
  })

  it('should replace page root with the specified component', () => {
    const serializedOldRoot = serializeComponent(page.root)
    const copiedComponentCount = computeComponentCount(copiedComponent)

    // Replace page root
    applyReplacePageRoot(site, replacePageRootData)

    // Assert all old component ids are removed from the context.
    assertComponentRemoved(serializedOldRoot)

    // Assert component count is different after replace.
    // The root component is replaced, so the number of components will be reduced by
    // at least 1 after replacement.
    const componentCountAfter = computeComponentCount()
    expect(componentCountAfter).toEqual(copiedComponentCount)

    // Assert all fields in the new root & its children, except id and parentId, are
    // the same as the copied component.
    const serializedCopiedComponent = serializeComponent(copiedComponent)
    const serializedNewRoot = serializeComponent(page.root)
    compareComponent(
      serializedCopiedComponent,
      serializedNewRoot,
      new Set(['id', 'parentId']),
    )
  })

  it('should replace page root with the specified component and undo', () => {
    const serializedOldRoot = serializeComponent(page.root)

    const nextIdBefore = site.context.nextId
    const componentCountBefore = computeComponentCount()

    // Replace page root
    applyReplacePageRoot(site, replacePageRootData)
    const newRoot = serializeComponent(page.root)

    // Undo replace page root
    undoReplacePageRoot(site, replacePageRootData)

    // Assert all new component ids are removed from the context.
    assertComponentRemoved(newRoot)

    // Assert component count is the same after undo
    const componentCountAfter = computeComponentCount()
    expect(componentCountBefore).toEqual(componentCountAfter)

    // Assert nextId in site context is restored
    const nextIdAfter = site.context.nextId
    expect(nextIdBefore).toEqual(nextIdAfter)

    // Assert all fields in the restored root & its children are the same as the old root & its children.
    const restoredRoot = serializeComponent(page.root)
    compareComponent(serializedOldRoot, restoredRoot)
  })
})
