import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { IMergeComponentStyleData } from '@pubstudio/shared/type-command-data'
import { IComponentStyle, ISerializedComponent, ISite } from '@pubstudio/shared/type-site'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/web/util-test-mock'
import { applyAddComponent } from '../component/add-component'
import {
  applyMergeComponentStyle,
  undoMergeComponentStyle,
} from './merge-component-style'

describe('Merge Component Custom Style', () => {
  let siteString: string
  let site: ISite
  let oldStyle: IComponentStyle
  let newStyle: IComponentStyle
  let component: ISerializedComponent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    oldStyle = {
      custom: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            width: '100px',
            height: '200px',
          },
          ':hover': {
            'background-color': 'red',
          },
        },
      },
      mixins: ['a', 'b'],
    }

    newStyle = {
      custom: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            width: '300px',
          },
          ':active': {
            height: '400px',
          },
        },
      },
      mixins: ['a', 'b', 'c', 'd'],
    }

    component = mockSerializedComponent(site, {
      style: oldStyle,
    })
    applyAddComponent(site, mockAddComponentData(component))
  })

  it('should merge component style', () => {
    const data: IMergeComponentStyleData = {
      componentId: component.id,
      oldStyle,
      newStyle,
    }
    applyMergeComponentStyle(site, data)

    // Custom styles should be merged and de-duplicated with existing ones; new styles take precedence.
    const resultCmp = resolveComponent(site.context, component.id)
    expect(resultCmp?.style.custom).toEqual({
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          width: '300px',
          height: '200px',
        },
        ':hover': {
          'background-color': 'red',
        },
        ':active': {
          height: '400px',
        },
      },
    })
    // Mixins should be unique
    expect(resultCmp?.style.mixins).toEqual(['a', 'b', 'c', 'd'])
  })

  it('should undo merge component style', () => {
    const data: IMergeComponentStyleData = {
      componentId: component.id,
      oldStyle,
      newStyle,
    }

    // Merge component style and undo
    applyMergeComponentStyle(site, data)
    undoMergeComponentStyle(site, data)

    // Assert style is not modified
    const resultCmp = resolveComponent(site.context, component.id)
    expect(resultCmp?.style).toEqual(oldStyle)
  })
})
