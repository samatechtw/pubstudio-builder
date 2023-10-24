import { applyAddComponent } from '@pubstudio/frontend/feature-command'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import {
  mockAddComponentData,
  mockSerializedComponent,
} from '@pubstudio/frontend/util-test-mock'
import { ISerializedComponent, ISite } from '@pubstudio/shared/type-site'
import { IUseBuild, useBuild } from './use-build'
import { IUseCopyPaste, useCopyPaste } from './use-copy-paste'

jest.mock('vue-i18n', () => ({ useI18n: () => ({ t: jest.fn() }) }))
jest.mock('@pubstudio/frontend/ui-widgets', () => ({
  useHUD: () => ({ addHUD: jest.fn() }),
}))

describe('use-build composable', () => {
  let build: IUseBuild
  let site: ISite
  let copyPaste: IUseCopyPaste
  let childComponent: ISerializedComponent

  beforeEach(async () => {
    build = useBuild()
    await build.initializeBuilder(undefined)
    site = build.site.value
    copyPaste = useCopyPaste()

    const component = mockSerializedComponent(site, {
      style: {
        custom: {
          [DEFAULT_BREAKPOINT_ID]: {
            default: { width: '100px', height: '100px' },
            ':hover': { 'background-color': 'red' },
          },
        },
        mixins: ['a', 'b'],
      },
      parentId: 'test-c-0',
    })
    // Add a component with style
    const mockData = mockAddComponentData(component)
    applyAddComponent(site, mockData)
    const childStyle = {
      custom: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: { color: 'green', width: '50px' },
        },
      },
      mixins: ['p'],
    }
    // Add a childComponent that inherits `component`
    childComponent = mockSerializedComponent(site, {
      style: childStyle,
      parentId: 'test-c-0',
    })
    applyAddComponent(site, mockAddComponentData(childComponent, component.id))
  })

  it('should copy paste component', () => {
    // Add a component to receive the copied style
    const targetComponent = mockSerializedComponent(site, {
      parentId: 'test-c-0',
      style: { custom: {} },
    })
    applyAddComponent(site, mockAddComponentData(targetComponent))
    // Set target component as selected
    if (build.editor.value) {
      build.editor.value.selectedComponent = targetComponent
    }

    copyPaste.pasteStyle(childComponent)

    // Include inherited style from copied component's parent
    const resultCmp = resolveComponent(site.context, targetComponent.id)
    expect(resultCmp?.style.custom).toEqual({
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          color: 'green',
          width: '50px',
          height: '100px',
        },
        ':hover': {
          'background-color': 'red',
        },
      },
    })
    expect(resultCmp?.style.mixins).toEqual(['p', 'a', 'b'])
  })
})
