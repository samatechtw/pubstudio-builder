import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { IComponent, ISerializedSite, ISite, Tag } from '@pubstudio/shared/type-site'
import { migrateSiteVersion } from './migrate-site'

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

  beforeEach(() => {
    site = deserializeSite(JSON.stringify(v2Site())) as ISite
    root = site.pages['/home'].root
    migrateSiteVersion(site, '3')
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
    expect(Object.keys(instance.style.overrides ?? {})).toEqual([DEFINITION_CHILD])
  })

  it('re-points behavior args at the definition child', () => {
    const button = resolveComponent(site.context, BUTTON) as IComponent
    expect(button.events?.click.behaviors[0].args?.id).toEqual(DEFINITION_CHILD)
  })

  it('keeps the shell custom style alongside the more specific override', () => {
    const instance = resolveComponent(site.context, INSTANCE) as IComponent
    const styles = instance.style.overrides?.[DEFINITION_CHILD][DEFAULT_BREAKPOINT_ID]
    expect(styles?.default).toEqual({ color: '#222222', 'font-size': '20px' })
  })
})
