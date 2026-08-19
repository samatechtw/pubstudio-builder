import {
  applyCommand,
  pushAppliedGroup,
  undoLastCommand,
} from '@pubstudio/frontend/data-access-command'
import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import {
  AriaRole,
  ComponentEventType,
  Css,
  CssPseudoClass,
  ISite,
  Tag,
} from '@pubstudio/shared/type-site'
import { exampleComponentId, examplePageRoute } from '../op/op-helpers'
import { makeTestSite, siteContentSnapshot, testOpCtx } from '../op/test-site'
import { parseSchema } from '../schema/schema'
import { addComponentOp, MAX_TREE_DEPTH, MAX_TREE_NODES } from './component'

describe('addComponent source validation', () => {
  let site: ISite
  let parentId: string

  const add = (input: Record<string, unknown>): ICommand<IAddComponentData> => {
    const parsed = parseSchema(addComponentOp.input, { parentId, ...input })
    if (!parsed.ok) {
      throw new Error(JSON.stringify(parsed.issues))
    }
    return addComponentOp.resolve(
      testOpCtx(site),
      parsed.value,
    ) as ICommand<IAddComponentData>
  }

  beforeEach(() => {
    site = makeTestSite()
    parentId = site.pages[examplePageRoute(site)].root.id
  })

  it('rejects a builtin sourceId, naming it as the problem', () => {
    expect(() => add({ sourceId: 'global-c-mailinglist' })).toThrow(/is a builtin/)
  })

  it('rejects an unknown sourceId', () => {
    expect(() => add({ sourceId: 'test-c-999' })).toThrow(
      /sourceId: no component "test-c-999"/,
    )
  })

  it('rejects a customComponentId that was never registered', () => {
    expect(() => add({ customComponentId: exampleComponentId(site) })).toThrow(
      /is not a custom component/,
    )
  })

  it('accepts a sourceId that exists in the site', () => {
    expect(() => add({ sourceId: exampleComponentId(site) })).not.toThrow()
  })

  it('accepts a registered customComponentId', () => {
    const componentId = exampleComponentId(site)
    const register: ICommand = {
      type: CommandType.AddCustomComponent,
      data: { componentId },
    }
    applyCommand(site, register)
    expect(() => add({ customComponentId: componentId })).not.toThrow()
  })

  it('requires tag when neither source field is provided', () => {
    expect(() => add({})).toThrow(/tag.*required/)
    expect(() => add({ tag: Tag.Div })).not.toThrow()
  })

  it('derives tag from sourceId when tag is omitted or conflicts', () => {
    const sourceId = exampleComponentId(site)
    site.context.components[sourceId].tag = Tag.Span

    expect(add({ sourceId }).data.tag).toBe(Tag.Span)
    expect(add({ sourceId, tag: Tag.Div }).data.tag).toBe(Tag.Span)
  })

  it('derives tag from customComponentId when tag is omitted', () => {
    const componentId = exampleComponentId(site)
    site.context.components[componentId].tag = Tag.Button
    applyCommand(site, {
      type: CommandType.AddCustomComponent,
      data: { componentId },
    })

    expect(add({ customComponentId: componentId }).data.tag).toBe(Tag.Button)
  })

  it('does not advertise tag as unconditionally required', () => {
    const required = addComponentOp.input.toJson().required as string[]
    expect(required).toEqual(['parentId'])
  })
})

describe('addComponent recursive tree', () => {
  let site: ISite
  let parentId: string
  let mixinId: string
  let behaviorId: string

  const add = (input: Record<string, unknown>): ICommand<IAddComponentData> => {
    const parsed = parseSchema(addComponentOp.input, { parentId, ...input })
    if (!parsed.ok) {
      throw new Error(JSON.stringify(parsed.issues))
    }
    return addComponentOp.resolve(
      testOpCtx(site),
      parsed.value,
    ) as ICommand<IAddComponentData>
  }

  beforeEach(() => {
    site = makeTestSite()
    parentId = site.pages[examplePageRoute(site)].root.id
    mixinId = site.context.styleOrder[0]
    behaviorId = Object.keys(site.context.behaviors)[0]
  })

  it('creates a three-level tree with styles, mixins, io, state, events and a role, and undoes in one step', () => {
    const before = siteContentSnapshot(site)
    const nextIdBefore = site.context.nextId

    const command = add({
      tag: Tag.Header,
      name: 'Hero',
      role: AriaRole.Banner,
      mixinIds: [mixinId],
      style: [
        { property: Css.Display, value: 'flex' },
        { property: Css.Width, value: '50%', breakpointId: 'breakpoint-3' },
        { property: Css.Color, value: '#ff0000', pseudoClass: CssPseudoClass.Hover },
      ],
      state: { open: true },
      events: [{ name: ComponentEventType.Click, behaviors: [{ behaviorId }] }],
      children: [
        { tag: Tag.H1, name: 'Title', content: 'Hello' },
        {
          tag: Tag.Div,
          name: 'Body',
          children: [
            {
              tag: Tag.A,
              name: 'Link',
              content: 'Go',
              inputs: [{ name: 'href', value: '/stories' }],
            },
          ],
        },
      ],
    })
    applyCommand(site, command)

    const root = site.context.components[command.data.id as string]
    expect(root.tag).toEqual(Tag.Header)
    expect(root.role).toEqual(AriaRole.Banner)
    expect(root.style.mixins).toEqual([mixinId])
    const custom = root.style.custom
    expect(custom[DEFAULT_BREAKPOINT_ID]?.default?.display).toEqual('flex')
    expect(custom['breakpoint-3']?.default?.width).toEqual('50%')
    expect(custom[DEFAULT_BREAKPOINT_ID]?.[CssPseudoClass.Hover]?.color).toEqual(
      '#ff0000',
    )
    expect(root.state).toEqual({ open: true })
    expect(root.events?.[ComponentEventType.Click]?.behaviors).toEqual([{ behaviorId }])
    expect(root.children?.map((c) => c.name)).toEqual(['Title', 'Body'])
    const link = root.children?.[1]?.children?.[0]
    expect(link?.content).toEqual('Go')
    expect(link?.inputs?.href).toEqual({
      name: 'href',
      type: 'string',
      attr: true,
      is: '/stories',
    })

    pushAppliedGroup(site, [command], 'tree')
    undoLastCommand(site)
    expect(siteContentSnapshot(site)).toEqual(before)
    expect(site.context.nextId).toEqual(nextIdBefore)
  })

  it('orders siblings by array position', () => {
    const command = add({
      tag: Tag.Div,
      children: [
        { tag: Tag.Span, name: 'one' },
        { tag: Tag.Span, name: 'two' },
        { tag: Tag.Span, name: 'three' },
      ],
    })
    applyCommand(site, command)
    const root = site.context.components[command.data.id as string]
    expect(root.children?.map((c) => c.name)).toEqual(['one', 'two', 'three'])
  })

  it('rejects content combined with children', () => {
    expect(() =>
      add({ tag: Tag.Div, content: 'x', children: [{ tag: Tag.Span }] }),
    ).toThrow(/content cannot be combined with `children`/)
  })

  it('rejects children combined with sourceId or customComponentId', () => {
    const componentId = exampleComponentId(site)
    expect(() => add({ sourceId: componentId, children: [{ tag: Tag.Span }] })).toThrow(
      /children cannot be combined/,
    )

    applyCommand(site, { type: CommandType.AddCustomComponent, data: { componentId } })
    expect(() =>
      add({ customComponentId: componentId, children: [{ tag: Tag.Span }] }),
    ).toThrow(/children cannot be combined/)
  })

  it('requires tag on a child node, naming the path', () => {
    expect(() => add({ tag: Tag.Div, children: [{ name: 'Untagged' }] })).toThrow(
      /children\[0\]\.tag is required/,
    )
  })

  it('names the path of an unknown mixin deep in the tree', () => {
    expect(() =>
      add({
        tag: Tag.Div,
        children: [
          { tag: Tag.Div },
          { tag: Tag.Div, children: [{ tag: Tag.Span, mixinIds: ['test-s-99'] }] },
        ],
      }),
    ).toThrow(/children\[1\]\.children\[0\]\.mixinIds\[0\]: no style mixin "test-s-99"/)
  })

  it('names the path of an unknown behavior deep in the tree', () => {
    expect(() =>
      add({
        tag: Tag.Div,
        children: [
          {
            tag: Tag.Span,
            events: [
              {
                name: ComponentEventType.Click,
                behaviors: [{ behaviorId }, { behaviorId: 'test-b-99' }],
              },
            ],
          },
        ],
      }),
    ).toThrow(/children\[0\]\.events\[0\]\.behaviors\[1\]: no behavior "test-b-99"/)
  })

  it('names the path of an unknown sourceId on a child', () => {
    expect(() => add({ tag: Tag.Div, children: [{ sourceId: 'test-c-999' }] })).toThrow(
      /children\[0\]\.sourceId: no component "test-c-999"/,
    )
  })

  it('accepts builtin behavior ids in events', () => {
    const builtinId = Object.keys(builtinBehaviors)[0]
    expect(() =>
      add({
        tag: Tag.Div,
        events: [
          { name: ComponentEventType.Click, behaviors: [{ behaviorId: builtinId }] },
        ],
      }),
    ).not.toThrow()
  })

  it('rejects duplicate input and event names', () => {
    expect(() =>
      add({
        tag: Tag.Div,
        inputs: [
          { name: 'href', value: '/a' },
          { name: 'href', value: '/b' },
        ],
      }),
    ).toThrow(/inputs\[1\]: duplicate input "href"/)
    expect(() =>
      add({
        tag: Tag.Div,
        events: [
          { name: ComponentEventType.Click, behaviors: [{ behaviorId }] },
          { name: ComponentEventType.Click, behaviors: [{ behaviorId }] },
        ],
      }),
    ).toThrow(/events\[1\]: duplicate event "click"/)
  })

  it('rejects a tree deeper than the depth limit, and accepts one at the limit', () => {
    const chain = (depth: number): Record<string, unknown> => {
      let node: Record<string, unknown> = { tag: Tag.Span }
      for (let i = 1; i < depth; i += 1) {
        node = { tag: Tag.Div, children: [node] }
      }
      return node
    }
    expect(() => add(chain(MAX_TREE_DEPTH))).not.toThrow()
    expect(() => add(chain(MAX_TREE_DEPTH + 1))).toThrow(/maximum tree depth/)
  })

  it('rejects a tree with more nodes than the limit, and accepts a 114-node page', () => {
    const wide = (count: number): Record<string, unknown> => ({
      tag: Tag.Div,
      children: Array.from({ length: count - 1 }, () => ({ tag: Tag.Div })),
    })
    expect(() => add(wide(114))).not.toThrow()
    expect(() => add(wide(MAX_TREE_NODES + 1))).toThrow(
      new RegExp(`more than ${MAX_TREE_NODES} nodes`),
    )
  })

  it('a deep failure resolves to no command at all', () => {
    const before = siteContentSnapshot(site)
    expect(() =>
      add({
        tag: Tag.Div,
        children: [{ tag: Tag.Span }, { tag: Tag.Span, mixinIds: ['test-s-99'] }],
      }),
    ).toThrow()
    expect(siteContentSnapshot(site)).toEqual(before)
  })
})
