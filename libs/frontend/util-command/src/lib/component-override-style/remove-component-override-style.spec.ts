import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockRemoveComponentOverrideStyleData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  Css,
  CssPseudoClass,
  ISerializedComponent,
  ISite,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applySetComponentOverrideStyle } from './set-component-override-style'
import {
  applyRemoveComponentOverrideStyle,
  undoRemoveComponentOverrideStyle,
} from './remove-component-override-style'

describe('Remove Component Override Style', () => {
  let siteString: string
  let site: ISite
  let selector: string
  let entries: IStyleEntry[]
  let component: ISerializedComponent

  const getDefaultPseudo = () => {
    return (
      component.style.overrides?.[selector]?.[DEFAULT_BREAKPOINT_ID]?.[
        CssPseudoClass.Default
      ] ?? {}
    )
  }

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    selector = 'test-c-100'
    entries = [
      {
        pseudoClass: CssPseudoClass.Default,
        property: Css.Width,
        value: '999px',
      },
      {
        pseudoClass: CssPseudoClass.Default,
        property: Css.Height,
        value: '888px',
      },
    ]
    component = mockSerializedComponent(site)
    applyAddComponent(site, mockAddComponentData(component))
    entries.forEach((entry) => {
      applySetComponentOverrideStyle(site, {
        selector,
        componentId: component.id,
        breakpointId: DEFAULT_BREAKPOINT_ID,
        oldStyle: undefined,
        newStyle: entry,
      })
    })
  })

  it('should remove component override style', () => {
    // Assert override styles exist before removing
    expect(Object.keys(getDefaultPseudo())).toHaveLength(entries.length)

    // Remove override style
    const data = mockRemoveComponentOverrideStyleData(
      component.id,
      selector,
      component.style.overrides ?? {},
    )
    applyRemoveComponentOverrideStyle(site, data)

    // Assert override styles are removed
    expect(selector in (component.style.overrides ?? {})).toEqual(false)
  })

  it('should undo remove component override style', () => {
    const data = mockRemoveComponentOverrideStyleData(
      component.id,
      selector,
      component.style.overrides?.[selector] ?? {},
    )
    applyRemoveComponentOverrideStyle(site, data)
    undoRemoveComponentOverrideStyle(site, data)

    // Assert override styles still exist
    expect(Object.keys(getDefaultPseudo())).toHaveLength(entries.length)
  })
})
