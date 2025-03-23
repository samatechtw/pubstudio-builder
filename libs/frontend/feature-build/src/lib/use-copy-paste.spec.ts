import { applyAddComponent } from '@pubstudio/frontend/data-access-command'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  mockAddComponentData,
  mockSerializedComponent,
} from '@pubstudio/frontend/util-test-mock'
import { IComponent, ISerializedComponent, ISite } from '@pubstudio/shared/type-site'
import { IUseBuild, useBuild } from './use-build'
import { IUseCopyPaste, useCopyPaste } from './use-copy-paste'

jest.mock('petite-vue-i18n', () => ({ useI18n: () => ({ t: jest.fn() }) }))
jest.mock('@pubstudio/frontend/util-ui-alert', () => ({
  addToast: jest.fn(),
  addHUD: jest.fn(),
  uiAlert: jest.fn(),
}))

describe('use-build composable', () => {
  let build: IUseBuild
  let site: ISite
  let copyPaste: IUseCopyPaste
  let childComponent: ISerializedComponent

  beforeEach(async () => {
    build = useBuild()
    await initializeSiteStore({ siteId: undefined })
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
    const child = mockSerializedComponent(site, {
      style: childStyle,
      parentId: 'test-c-0',
    })
    applyAddComponent(site, mockAddComponentData(child, component.id))
    childComponent = resolveComponent(site.context, child.id) as IComponent
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
