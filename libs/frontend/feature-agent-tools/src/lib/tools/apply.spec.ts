import { IUseSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ISite, Tag } from '@pubstudio/shared/type-site'
import { ref } from 'vue'
import { examplePageRoute } from '../op/op-helpers'
import { makeTestSite, siteContentSnapshot } from '../op/test-site'
import { applyOps, ICreatedComponentTree } from './apply'
import { endSession, startSession } from './session'

// applyOps flushes a render frame after the batch; the node test env has no rAF
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
  cb(0)
  return 0
}) as typeof requestAnimationFrame

const fakeSource = (site: ISite): IUseSiteSource =>
  ({
    site: ref(site),
    apiSiteId: ref('scratch'),
    siteStore: { save: () => Promise.resolve() },
  }) as unknown as IUseSiteSource

const treeIds = (tree: ICreatedComponentTree): string[] => [
  tree.id,
  ...(tree.children ?? []).flatMap(treeIds),
]

describe('apply with a recursive addComponent', () => {
  let site: ISite
  let parentId: string

  beforeEach(() => {
    site = makeTestSite()
    parentId = site.pages[examplePageRoute(site)].root.id
    startSession(fakeSource(site))
  })

  afterEach(() => {
    endSession()
  })

  it('applies a tree as one command and one undo step, reporting the created id tree', async () => {
    const result = await applyOps({
      save: 'none',
      ops: [
        {
          op: 'addComponent',
          input: {
            parentId,
            tag: Tag.Header,
            name: 'Hero',
            children: [
              { tag: Tag.H1, content: 'Title' },
              { tag: Tag.Div, children: [{ tag: Tag.Span, content: 'Nested' }] },
            ],
          },
        },
      ],
    })
    expect(result.ok).toEqual(true)
    const out = result.result as NonNullable<typeof result.result>
    expect(out.commandCount).toEqual(1)
    expect(out.undoSteps).toEqual(1)
    expect(site.history.back).toHaveLength(1)

    // Root-only, backward compatible
    expect(out.createdComponentIds).toHaveLength(1)
    const rootId = out.createdComponentIds[0]

    expect(out.createdComponentTrees).toHaveLength(1)
    const tree = out.createdComponentTrees[0]
    expect(tree.id).toEqual(rootId)
    expect(tree.children).toHaveLength(2)
    expect(tree.children?.[1].children).toHaveLength(1)
    // Every reported id resolves, and the shape matches the created components
    for (const id of treeIds(tree)) {
      expect(site.context.components[id]).toBeDefined()
    }
    expect(site.context.components[rootId].children?.[0].id).toEqual(
      tree.children?.[0].id,
    )
  })

  it('reports implicit descendants when copying with sourceId', async () => {
    const built = await applyOps({
      save: 'none',
      ops: [
        {
          op: 'addComponent',
          input: {
            parentId,
            tag: Tag.Div,
            children: [{ tag: Tag.Span }, { tag: Tag.Span }],
          },
        },
      ],
    })
    const sourceId = (built.result as { createdComponentIds: string[] })
      .createdComponentIds[0]

    const copied = await applyOps({
      save: 'none',
      ops: [{ op: 'addComponent', input: { parentId, sourceId } }],
    })
    expect(copied.ok).toEqual(true)
    const tree = (copied.result as { createdComponentTrees: ICreatedComponentTree[] })
      .createdComponentTrees[0]
    // The input named no children, but the copy created two
    expect(tree.children).toHaveLength(2)
  })

  it('applies nothing and records no history when a deep node is invalid', async () => {
    const before = siteContentSnapshot(site)
    const result = await applyOps({
      save: 'none',
      ops: [
        {
          op: 'addComponent',
          input: {
            parentId,
            tag: Tag.Div,
            children: [{ tag: Tag.Span }, { tag: Tag.Span, mixinIds: ['test-s-99'] }],
          },
        },
      ],
    })
    expect(result.ok).toEqual(false)
    if (!result.ok) {
      expect(result.error.message).toContain('children[1].mixinIds[0]')
      expect(result.result?.partial).toBeFalsy()
    }
    expect(site.history.back).toHaveLength(0)
    expect(siteContentSnapshot(site)).toEqual(before)
  })

  it('reports an applied tree even when a later op in the batch fails', async () => {
    const result = await applyOps({
      save: 'none',
      ops: [
        {
          op: 'addComponent',
          input: { parentId, tag: Tag.Div, children: [{ tag: Tag.Span }] },
        },
        { op: 'removeComponent', input: { componentId: 'test-c-999' } },
      ],
    })
    expect(result.ok).toEqual(false)
    if (!result.ok) {
      expect(result.result?.partial).toEqual(true)
      expect(result.result?.createdComponentTrees).toHaveLength(1)
      expect(result.result?.createdComponentTrees[0].children).toHaveLength(1)
    }
  })
})
