import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockAddComponentOverrideStyleData,
  mockEditComponentOverrideStyleData,
  mockRemoveComponentOverrideStyleEntryData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  Css,
  CssPseudoClass,
  CssPseudoClassType,
  CssPseudoClassValues,
  ISerializedComponent,
  ISite,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import {
  applySetComponentOverrideStyle,
  undoSetComponentOverrideStyle,
} from './set-component-override-style'

describe('Set Component Override Style', () => {
  let siteString: string
  let site: ISite
  let selector: string
  let oldStyle: IStyleEntry
  let newStyle: IStyleEntry
  let component: ISerializedComponent

  const getDefaultPseudo = (componentId: string, pseudo: CssPseudoClassType) => {
    const cmp = resolveComponent(site.context, componentId)
    return cmp?.style.overrides?.[selector]?.[DEFAULT_BREAKPOINT_ID][pseudo]
  }

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    selector = 'test-c-100'
  })

  describe('add override style', () => {
    beforeEach(() => {
      newStyle = {
        pseudoClass: CssPseudoClass.Default,
        property: Css.BackgroundColor,
        value: 'red',
      }
      component = mockSerializedComponent(site)
      applyAddComponent(site, mockAddComponentData(component))
    })

    it('should add component override style', () => {
      // Assert there's no property with the same key before adding
      const pseudo = getDefaultPseudo(component.id, CssPseudoClass.Default)
      expect(pseudo?.[newStyle.property]).toBeUndefined()

      // Add override style
      const data = mockAddComponentOverrideStyleData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentOverrideStyle(site, data)

      // Assert property is added
      const newPseudo = getDefaultPseudo(component.id, CssPseudoClass.Default)
      expect(newPseudo?.[newStyle.property]).toEqual(newStyle.value)
    })

    it('should not add component override style to non-default pseudo-class', () => {
      const nonDefaultPseudoClasses = CssPseudoClassValues.filter(
        (pseudoClass) => pseudoClass !== CssPseudoClass.Default,
      )

      // Assert there are no properties in unspecified pseudo-class before adding
      nonDefaultPseudoClasses.forEach((pseudoClass) => {
        expect(component.style.overrides?.[pseudoClass]).toBeUndefined()
      })

      // Add override style
      const data = mockAddComponentOverrideStyleData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentOverrideStyle(site, data)

      // Assert there are still no properties in unspecified pseudo-class after adding
      const resultComponent = resolveComponent(site.context, component.id)
      nonDefaultPseudoClasses.forEach((pseudoClass) => {
        expect(resultComponent?.style.overrides?.[pseudoClass]).toBeUndefined()
      })
    })

    it('should undo add component override style', () => {
      // Add override style and undo
      const data = mockAddComponentOverrideStyleData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentOverrideStyle(site, data)
      undoSetComponentOverrideStyle(site, data)

      // Assert style does not exist in component
      const newPseudo = getDefaultPseudo(component.id, CssPseudoClass.Default)
      expect(newPseudo?.[newStyle.property]).toBeUndefined()
    })
  })

  describe('edit component override style', () => {
    beforeEach(() => {
      oldStyle = {
        pseudoClass: CssPseudoClass.Hover,
        property: Css.BackgroundColor,
        value: 'red',
      }
      component = mockSerializedComponent(site, {
        style: {
          custom: {},
          overrides: {
            [selector]: {
              [DEFAULT_BREAKPOINT_ID]: {
                [oldStyle.pseudoClass]: {
                  [oldStyle.property]: oldStyle.value,
                },
              },
            },
          },
        },
      })
      applyAddComponent(site, mockAddComponentData(component))
    })

    it('should edit component override style', () => {
      const newValue = 'blue'

      // Assert old style exists in component
      const rawStyle = getDefaultPseudo(component.id, oldStyle.pseudoClass)
      expect(rawStyle?.[oldStyle.property]).toEqual(oldStyle.value)

      // Update override style
      const newStyle: IStyleEntry = {
        ...oldStyle,
        value: newValue,
      }
      const data = mockEditComponentOverrideStyleData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        oldStyle,
        newStyle,
      )
      applySetComponentOverrideStyle(site, data)

      // Assert style is updated
      const updatedRawStyle = getDefaultPseudo(component.id, oldStyle.pseudoClass)
      expect(updatedRawStyle?.[oldStyle.property]).toEqual(newStyle.value)
    })

    it('should undo edit component override style', () => {
      // Update override style and undo
      const newStyle: IStyleEntry = {
        ...oldStyle,
        value: 'blue',
      }
      const data = mockEditComponentOverrideStyleData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        oldStyle,
        newStyle,
      )
      applySetComponentOverrideStyle(site, data)
      undoSetComponentOverrideStyle(site, data)

      // Assert style is not modified
      const updatedRawStyle = getDefaultPseudo(component.id, oldStyle.pseudoClass)
      expect(updatedRawStyle?.[oldStyle.property]).toEqual(oldStyle.value)
    })
  })

  describe('remove component override style', () => {
    let style: IStyleEntry

    beforeEach(() => {
      siteString = JSON.stringify(mockSerializedSite)
      site = deserializeSite(siteString) as ISite
      style = {
        pseudoClass: CssPseudoClass.Hover,
        property: Css.BackgroundColor,
        value: 'green',
      }
      component = mockSerializedComponent(site, {
        style: {
          custom: {},
          overrides: {
            [selector]: {
              [DEFAULT_BREAKPOINT_ID]: {
                [style.pseudoClass]: {
                  [style.property]: style.value,
                },
              },
            },
          },
        },
      })
      applyAddComponent(site, mockAddComponentData(component))
    })

    it('should remove component override style', () => {
      // Assert style exists in component
      const oldPseudo = getDefaultPseudo(component.id, style.pseudoClass)
      expect(oldPseudo?.[style.property]).toEqual(style.value)

      // Remove override style
      const data = mockRemoveComponentOverrideStyleEntryData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        style,
      )
      applySetComponentOverrideStyle(site, data)

      // Assert style is removed
      const newPseudo = getDefaultPseudo(component.id, style.pseudoClass)
      expect(newPseudo?.[style.property]).toBeUndefined()
    })

    it('should undo remove component override style', () => {
      // Remove style and undo
      const data = mockRemoveComponentOverrideStyleEntryData(
        component.id,
        selector,
        DEFAULT_BREAKPOINT_ID,
        style,
      )
      applySetComponentOverrideStyle(site, data)
      undoSetComponentOverrideStyle(site, data)

      // Assert style still exists in component
      const pseudo = getDefaultPseudo(component.id, style.pseudoClass)
      expect(pseudo?.[style.property]).toEqual(style.value)
    })
  })
})
