import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISiteMigrationData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISerializedSite, ISite, Tag } from '@pubstudio/shared/type-site'
import { pushCommand, redoCommand, undoLastCommand } from '../command'

const DEFINITION = 'test-c-10'
const DEFINITION_CHILD = 'test-c-11'
const INSTANCE = 'test-c-12'
const SHELL = 'test-c-13'
const BUTTON = 'test-c-14'

// A v2 site: the definition sits on the page it was converted from, and the instance
// mirrors it with an empty shell subtree.
const v2Site = (): ISerializedSite => ({
  ...mockSerializedSite,
  version: '2',
  context: {
    ...mockSerializedSite.context,
    nextId: 15,
    customComponentIds: [DEFINITION],
    customChildIds: [DEFINITION_CHILD],
    customComponents: undefined,
  },
  pages: {
    '/home': {
      ...mockSerializedSite.pages['/home'],
      root: {
        id: 'test-c-0',
        name: 'Root',
        tag: Tag.Div,
        style: { custom: {} },
        children: [
          {
            id: DEFINITION,
            name: 'Card',
            tag: Tag.Div,
            parentId: 'test-c-0',
            style: {
              custom: {},
              overrides: {
                [DEFINITION_CHILD]: {
                  [DEFAULT_BREAKPOINT_ID]: { default: { color: '#111111' } },
                },
              },
            },
            children: [
              {
                id: DEFINITION_CHILD,
                name: 'CardText',
                tag: Tag.Span,
                parentId: DEFINITION,
                content: 'definition text',
                style: { custom: {} },
              },
            ],
          },
          {
            id: INSTANCE,
            name: 'Card',
            tag: Tag.Div,
            parentId: 'test-c-0',
            customSourceId: DEFINITION,
            style: {
              custom: {},
              overrides: {
                [SHELL]: {
                  [DEFAULT_BREAKPOINT_ID]: { default: { color: '#222222' } },
                },
              },
            },
            children: [
              {
                id: SHELL,
                name: 'CardText',
                tag: Tag.Span,
                parentId: INSTANCE,
                customSourceId: DEFINITION_CHILD,
                content: 'instance text',
                style: {
                  custom: {
                    [DEFAULT_BREAKPOINT_ID]: { default: { 'font-size': '20px' } },
                  },
                },
              },
            ],
          },
          {
            id: BUTTON,
            name: 'Button',
            tag: Tag.Div,
            parentId: 'test-c-0',
            style: { custom: {} },
            events: {
              click: {
                name: 'click',
                behaviors: [{ behaviorId: 'global-b-toggleHidden', args: { id: SHELL } }],
              },
            },
          },
        ],
      },
    },
  },
})

describe('migrate v2 to v3', () => {
  let site: ISite
  let root: IComponent

  const migrate = () => {
    const data: ISiteMigrationData = { oldVersion: '2', newVersion: '3' }
    pushCommand(site, CommandType.MigrateSite, data)
  }

  beforeEach(() => {
    site = deserializeSite(JSON.stringify(v2Site())) as ISite
    root = site.pages['/home'].root
    migrate()
  })

  it('moves the definition off the page and leaves an instance', () => {
    const definition = resolveComponent(site.context, DEFINITION) as IComponent
    expect(site.version).toEqual('3')
    expect(definition.parent).toBeUndefined()
    expect(root.children?.[0]?.id).not.toEqual(DEFINITION)
    expect(root.children?.[0]?.customSourceId).toEqual(DEFINITION)
    expect(site.context.customComponentIds.has(DEFINITION)).toBe(true)
  })

  it('folds shell content into instance overrides and drops the shells', () => {
    const instance = resolveComponent(site.context, INSTANCE) as IComponent
    expect(instance.children).toBeUndefined()
    expect(resolveComponent(site.context, SHELL)).toBeUndefined()
    expect(instance.instanceOverrides?.[DEFINITION_CHILD]?.content).toEqual(
      'instance text',
    )
  })

  it('re-keys child style overrides from shell ids to definition child ids', () => {
    const instance = resolveComponent(site.context, INSTANCE) as IComponent
    const overrides = instance.style.overrides ?? {}
    expect(Object.keys(overrides)).toEqual([DEFINITION_CHILD])
    // Shell custom styles and the existing override both land on the definition child
    expect(overrides[DEFINITION_CHILD][DEFAULT_BREAKPOINT_ID].default).toEqual({
      color: '#222222',
    })
  })

  it('re-points behavior args at the definition child', () => {
    const button = resolveComponent(site.context, BUTTON) as IComponent
    expect(button.events?.click.behaviors[0].args?.id).toEqual(DEFINITION_CHILD)
  })

  it('rolls back to the v2 page layout', () => {
    undoLastCommand(site)
    expect(site.version).toEqual('2')
    expect(root.children?.[0]?.id).toEqual(DEFINITION)
    expect(resolveComponent(site.context, DEFINITION)?.parent?.id).toEqual('test-c-0')
    expect(root.children?.some((c) => c.customSourceId === DEFINITION)).toBe(true)
  })

  it('redoes the migration', () => {
    undoLastCommand(site)
    redoCommand(site)
    expect(site.version).toEqual('3')
    expect(resolveComponent(site.context, DEFINITION)?.parent).toBeUndefined()
    expect(root.children?.[0]?.customSourceId).toEqual(DEFINITION)
  })

  it('drops customChildIds from the serialized context', () => {
    expect('customChildIds' in site.context).toBe(false)
  })
})
