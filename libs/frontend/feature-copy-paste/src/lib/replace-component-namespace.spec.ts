import { behaviorId, componentId, styleId } from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  EditorEventName,
  ISerializedComponent,
  ISite,
  Tag,
} from '@pubstudio/shared/type-site'
import { replaceNamespace, replacePastedComponentNamespace } from './replace-namespace'

vi.mock('petite-vue-i18n', () => ({ useI18n: () => ({ t: vi.fn() }) }))
vi.mock('@pubstudio/frontend/util-ui-alert', () => ({
  addToast: vi.fn(),
  addHUD: vi.fn(),
  uiAlert: vi.fn(),
}))

describe('replace component namespace', () => {
  let oldNamespace: string
  let component: ISerializedComponent
  let originalCmpId: string
  let originalChildId: string

  beforeEach(async () => {
    oldNamespace = 'test'
    const cmpId = componentId(oldNamespace, '1')
    originalCmpId = cmpId
    const childId = componentId(oldNamespace, '10')
    originalChildId = childId
    component = {
      id: cmpId,
      name: `NewCmp1`,
      tag: Tag.Div,
      children: [
        {
          id: childId,
          name: `NewCmp1`,
          tag: Tag.Div,
          content: `This is a test: ${childId}`,
          parentId: cmpId,
          events: {
            TestEvent: {
              name: 'TestEvent',
              eventParams: {},
              behaviors: [
                {
                  args: { id: childId },
                  behaviorId: behaviorId(oldNamespace, '11'),
                },
              ],
            },
          },
          editorEvents: {
            [EditorEventName.OnSelfAdded]: {
              name: EditorEventName.OnSelfAdded,
              behaviors: [
                {
                  args: { id: childId },
                  behaviorId: behaviorId(oldNamespace, '12'),
                },
              ],
            },
          },
          style: {
            custom: {},
            mixins: [styleId(oldNamespace, '13'), styleId(oldNamespace, '14')],
          },
        },
      ],
      inputs: {
        TestInput: {
          type: ComponentArgPrimitive.String,
          name: 'TestInput',
          default: childId,
          is: childId,
        },
      },
      style: {
        custom: {},
        overrides: { [childId]: {} },
        mixins: [styleId(oldNamespace, '2')],
      },
    }
  })

  it('should replace all namespace references in component with children', () => {
    const newNamespace = 'newnamespace'
    replacePastedComponentNamespace(component, oldNamespace, newNamespace)

    const cmpId = componentId(newNamespace, '1')
    const childId = componentId(newNamespace, '10')
    expect(component).toEqual({
      id: cmpId,
      name: `NewCmp1`,
      tag: Tag.Div,
      children: [
        {
          id: childId,
          name: `NewCmp1`,
          tag: Tag.Div,
          // Not updated
          content: `This is a test: ${originalChildId}`,
          // Not updated (only children are used to recreated component tree)
          parentId: originalCmpId,
          events: {
            TestEvent: {
              name: 'TestEvent',
              eventParams: {},
              behaviors: [
                {
                  args: { id: childId },
                  behaviorId: behaviorId(newNamespace, '11'),
                },
              ],
            },
          },
          editorEvents: {
            [EditorEventName.OnSelfAdded]: {
              name: EditorEventName.OnSelfAdded,
              behaviors: [
                {
                  args: { id: childId },
                  behaviorId: behaviorId(newNamespace, '12'),
                },
              ],
            },
          },
          style: {
            custom: {},
            mixins: [styleId(newNamespace, '13'), styleId(newNamespace, '14')],
          },
        },
      ],
      inputs: {
        TestInput: {
          type: ComponentArgPrimitive.String,
          name: 'TestInput',
          default: childId,
          is: childId,
        },
      },
      style: {
        custom: {},
        overrides: { [childId]: {} },
        mixins: [styleId(newNamespace, '2')],
      },
    })
  })

  it('should replace ids with a collaboration client suffix', () => {
    const newNamespace = 'newnamespace'
    const suffix = '_a1b2c3d4e5'
    const cmpId = componentId(oldNamespace, `1${suffix}`)
    const childId = componentId(oldNamespace, `10${suffix}`)
    const suffixed: ISerializedComponent = {
      id: cmpId,
      name: 'Suffixed',
      tag: Tag.Div,
      children: [
        {
          id: childId,
          name: 'SuffixedChild',
          tag: Tag.Div,
          parentId: cmpId,
          events: {
            TestEvent: {
              name: 'TestEvent',
              eventParams: {},
              behaviors: [
                {
                  args: { id: childId },
                  behaviorId: behaviorId(oldNamespace, `11${suffix}`),
                },
              ],
            },
          },
          style: { custom: {}, mixins: [styleId(oldNamespace, `13${suffix}`)] },
        },
      ],
      inputs: {
        TestInput: {
          type: ComponentArgPrimitive.String,
          name: 'TestInput',
          default: childId,
          is: childId,
        },
      },
      style: { custom: {}, overrides: { [childId]: {} } },
    }

    replacePastedComponentNamespace(suffixed, oldNamespace, newNamespace)

    const newChildId = componentId(newNamespace, `10${suffix}`)
    const child = suffixed.children?.[0]
    expect(suffixed.id).toEqual(componentId(newNamespace, `1${suffix}`))
    expect(child?.id).toEqual(newChildId)
    expect(child?.events?.TestEvent.behaviors[0]).toEqual({
      args: { id: newChildId },
      behaviorId: behaviorId(newNamespace, `11${suffix}`),
    })
    expect(child?.style.mixins).toEqual([styleId(newNamespace, `13${suffix}`)])
    expect(suffixed.inputs?.TestInput.default).toEqual(newChildId)
    expect(suffixed.inputs?.TestInput.is).toEqual(newChildId)
    expect(suffixed.style.overrides).toEqual({ [newChildId]: {} })
  })

  it('should replace suffixed ids referenced in behavior code', () => {
    const newNamespace = 'newnamespace'
    const suffix = '_a1b2c3d4e5'
    const suffixedCmpId = componentId(oldNamespace, `3${suffix}`)
    const plainCmpId = componentId(oldNamespace, '4')
    const bId = behaviorId(oldNamespace, `5${suffix}`)
    const makeCode = (id1: string, id2: string) =>
      `getComponent('${id1}'); getComponent('${id2}')`
    const site = {
      context: {
        namespace: oldNamespace,
        styleOrder: [],
        styles: {},
        components: {},
        behaviors: {
          [bId]: {
            id: bId,
            name: 'Test',
            code: makeCode(suffixedCmpId, plainCmpId),
            args: {
              cmp: {
                name: 'cmp',
                type: ComponentArgPrimitive.String,
                default: suffixedCmpId,
              },
            },
          },
        },
      },
    } as unknown as ISite

    replaceNamespace(site, newNamespace)

    const newBId = behaviorId(newNamespace, `5${suffix}`)
    const newCmpId = componentId(newNamespace, `3${suffix}`)
    const behavior = site.context.behaviors[newBId]
    expect(behavior.id).toEqual(newBId)
    expect(behavior.code).toEqual(makeCode(newCmpId, componentId(newNamespace, '4')))
    expect(behavior.args?.cmp.default).toEqual(newCmpId)
  })
})
