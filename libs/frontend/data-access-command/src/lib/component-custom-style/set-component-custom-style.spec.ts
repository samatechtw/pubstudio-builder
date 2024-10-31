import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentCustomStyleData,
  mockAddComponentData,
  mockEditComponentCustomStyleData,
  mockRemoveComponentCustomStyleData,
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
  applySetComponentCustomStyle,
  undoSetComponentCustomStyle,
} from './set-component-custom-style'

describe('Set Component Custom Style', () => {
  let siteString: string
  let site: ISite
  let oldStyle: IStyleEntry
  let newStyle: IStyleEntry
  let component: ISerializedComponent

  const getDefaultPseudo = (componentId: string, pseudo: CssPseudoClassType) => {
    const cmp = resolveComponent(site.context, componentId)
    return cmp?.style.custom[DEFAULT_BREAKPOINT_ID][pseudo]
  }

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
  })

  describe('add custom style', () => {
    beforeEach(() => {
      newStyle = {
        pseudoClass: CssPseudoClass.Default,
        property: Css.BackgroundColor,
        value: 'red',
      }
      component = mockSerializedComponent(site)
      applyAddComponent(site, mockAddComponentData(component))
    })

    it('should add component custom style', () => {
      // Assert there's no property with the same key before adding
      const pseudo = getDefaultPseudo(component.id, CssPseudoClass.Default)
      expect(pseudo?.[newStyle.property]).toBeUndefined()

      // Add custom style
      const data = mockAddComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentCustomStyle(site, data)

      // Assert property is added
      const newPseudo = getDefaultPseudo(component.id, CssPseudoClass.Default)
      expect(newPseudo?.[newStyle.property]).toEqual(newStyle.value)
    })

    it('should not add component custom style to non-default pseudo-class', () => {
      const nonDefaultPseudoClasses = CssPseudoClassValues.filter(
        (pseudoClass) => pseudoClass !== CssPseudoClass.Default,
      )

      // Assert there are no properties in unspecified pseudo-class before adding
      nonDefaultPseudoClasses.forEach((pseudoClass) => {
        expect(component.style.custom[pseudoClass]).toBeUndefined()
      })

      // Add custom style
      const data = mockAddComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentCustomStyle(site, data)

      // Assert there are still no properties in unspecified pseudo-class after adding
      const resultComponent = resolveComponent(site.context, component.id)
      nonDefaultPseudoClasses.forEach((pseudoClass) => {
        expect(resultComponent?.style.custom[pseudoClass]).toBeUndefined()
      })
    })

    it('should undo add component custom style', () => {
      // Add custom style and undo
      const data = mockAddComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentCustomStyle(site, data)
      undoSetComponentCustomStyle(site, data)

      // Assert style does not exist in component
      const newPseudo = getDefaultPseudo(component.id, CssPseudoClass.Default)
      expect(newPseudo?.[newStyle.property]).toBeUndefined()
    })
  })

  describe('edit component custom style', () => {
    beforeEach(() => {
      oldStyle = {
        pseudoClass: CssPseudoClass.Hover,
        property: Css.BackgroundColor,
        value: 'red',
      }
      component = mockSerializedComponent(site, {
        style: {
          custom: {
            [DEFAULT_BREAKPOINT_ID]: {
              [oldStyle.pseudoClass]: {
                [oldStyle.property]: oldStyle.value,
              },
            },
          },
        },
      })
      applyAddComponent(site, mockAddComponentData(component))
    })

    it('should edit component custom style', () => {
      const newValue = 'blue'

      // Assert old style exists in component
      const rawStyle = getDefaultPseudo(component.id, oldStyle.pseudoClass)
      expect(rawStyle?.[oldStyle.property]).toEqual(oldStyle.value)

      // Update custom style
      const newStyle: IStyleEntry = {
        ...oldStyle,
        value: newValue,
      }
      const data = mockEditComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        oldStyle,
        newStyle,
      )
      applySetComponentCustomStyle(site, data)

      // Assert style is updated
      const updatedRawStyle = getDefaultPseudo(component.id, oldStyle.pseudoClass)
      expect(updatedRawStyle?.[oldStyle.property]).toEqual(newStyle.value)
    })

    it('should undo edit component custom style', () => {
      // Update custom style and undo
      const newStyle: IStyleEntry = {
        ...oldStyle,
        value: 'blue',
      }
      const data = mockEditComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        oldStyle,
        newStyle,
      )
      applySetComponentCustomStyle(site, data)
      undoSetComponentCustomStyle(site, data)

      // Assert style is not modified
      const updatedRawStyle = getDefaultPseudo(component.id, oldStyle.pseudoClass)
      expect(updatedRawStyle?.[oldStyle.property]).toEqual(oldStyle.value)
    })

    // When a new custom component style is added in the editor, it starts with the empty
    // string as its property. This simulates adding and modifying a new style in the editor.
    it('should add and edit empty component style', () => {
      const newStyle = {
        pseudoClass: CssPseudoClass.Default,
        property: '' as Css,
        value: '',
      }
      const pseudo = getDefaultPseudo(component.id, newStyle.pseudoClass)
      expect(pseudo?.[newStyle.property]).toBeUndefined()

      // Add custom style with empty property
      const addData = mockAddComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
      )
      applySetComponentCustomStyle(site, addData)

      // Assert style is added
      const newPseudo = getDefaultPseudo(component.id, newStyle.pseudoClass)
      expect(newPseudo?.[newStyle.property]).toEqual(newStyle.value)

      // Set empty property to new value
      const editStyle: IStyleEntry = {
        ...newStyle,
        property: Css.Margin,
      }
      const editData = mockEditComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
        editStyle,
      )
      applySetComponentCustomStyle(site, editData)

      // Assert empty property no longer exists
      const updatedPseudo = getDefaultPseudo(component.id, newStyle.pseudoClass)
      expect(updatedPseudo?.[newStyle.property]).toBeUndefined()

      // Assert property is updated, and value is not
      const updatedRawStyle = getDefaultPseudo(component.id, editStyle.pseudoClass)
      expect(updatedRawStyle?.[editStyle.property]).toEqual(newStyle.value)
    })
  })

  describe('remove component custom style', () => {
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
          custom: {
            [DEFAULT_BREAKPOINT_ID]: {
              [style.pseudoClass]: {
                [style.property]: style.value,
              },
            },
          },
        },
      })
      applyAddComponent(site, mockAddComponentData(component))
    })

    it('should remove component custom style', () => {
      // Assert style exists in component
      const oldPseudo = getDefaultPseudo(component.id, style.pseudoClass)
      expect(oldPseudo?.[style.property]).toEqual(style.value)

      // Remove custom style
      const data = mockRemoveComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        style,
      )
      applySetComponentCustomStyle(site, data)

      // Assert style is removed
      const newPseudo = getDefaultPseudo(component.id, style.pseudoClass)
      expect(newPseudo?.[style.property]).toBeUndefined()
    })

    it('should undo remove component custom style', () => {
      // Remove style and undo
      const data = mockRemoveComponentCustomStyleData(
        component.id,
        DEFAULT_BREAKPOINT_ID,
        style,
      )
      applySetComponentCustomStyle(site, data)
      undoSetComponentCustomStyle(site, data)

      // Assert style still exists in component
      const pseudo = getDefaultPseudo(component.id, style.pseudoClass)
      expect(pseudo?.[style.property]).toEqual(style.value)
    })
  })
})
