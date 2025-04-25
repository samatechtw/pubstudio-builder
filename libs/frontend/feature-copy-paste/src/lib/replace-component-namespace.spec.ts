import { behaviorId, componentId, styleId } from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  EditorEventName,
  ISerializedComponent,
  Tag,
} from '@pubstudio/shared/type-site'
import { replacePastedComponentNamespace } from './replace-namespace'

jest.mock('petite-vue-i18n', () => ({ useI18n: () => ({ t: jest.fn() }) }))
jest.mock('@pubstudio/frontend/util-ui-alert', () => ({
  addToast: jest.fn(),
  addHUD: jest.fn(),
  uiAlert: jest.fn(),
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
})
