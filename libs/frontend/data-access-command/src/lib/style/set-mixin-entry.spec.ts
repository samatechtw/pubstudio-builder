import { resolveComponent, resolveStyle } from '@pubstudio/frontend/util-builtin'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddMixinEntryData,
  mockAddStyleMixinData,
  mockRemoveMixinEntryData,
  mockSerializedSite,
  mockSetMixinEntryData,
} from '@pubstudio/frontend/util-test-mock'
import {
  Css,
  CssPseudoClass,
  CssPseudoClassValues,
  IPseudoStyle,
  ISite,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import { applyAddStyleMixin } from './add-style-mixin'
import { applySetMixinEntry, undoSetMixinEntry } from './set-mixin-entry'

describe('Set Mixin Entry', () => {
  let siteString: string
  let site: ISite
  let pseudoStyle: IPseudoStyle
  let mixinName: string
  let mixinId: string
  let oldStyle: IStyleEntry
  let newStyle: IStyleEntry

  const getDefaultPseudo = (mixinId: string, pseudo: CssPseudoClass) => {
    const cmp = resolveStyle(site.context, mixinId)
    return cmp?.breakpoints[DEFAULT_BREAKPOINT_ID][pseudo]
  }

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Add style mixin
    pseudoStyle = { default: {} }
    mixinName = 'Test Mixin Entry'
    const data = mockAddStyleMixinData(mixinName, pseudoStyle)
    mixinId = applyAddStyleMixin(site, data)
  })

  describe('add mixin entry', () => {
    beforeEach(() => {
      newStyle = {
        pseudoClass: CssPseudoClass.Default,
        property: Css.BackgroundColor,
        value: 'red',
      }
    })

    it('should add mixin entry', () => {
      // Assert there's no property with the same key before adding
      const pseudo = getDefaultPseudo(mixinId, CssPseudoClass.Default)
      expect(pseudo?.[newStyle.property]).toBeUndefined()

      // Add custom style
      const data = mockAddMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, newStyle)
      applySetMixinEntry(site, data)

      // Assert property is added
      const newPseudo = getDefaultPseudo(mixinId, CssPseudoClass.Default)
      expect(newPseudo?.[newStyle.property]).toEqual(newStyle.value)
    })

    it('should not add mixin entry to non-default pseudo-class', () => {
      const nonDefaultPseudoClasses = CssPseudoClassValues.filter(
        (pseudoClass) => pseudoClass !== CssPseudoClass.Default,
      )

      // Assert there are no properties in unspecified pseudo-class before adding
      const mixin = resolveStyle(site.context, mixinId)
      expect(mixin).toBeDefined()
      nonDefaultPseudoClasses.forEach((pseudoClass) => {
        expect(mixin?.breakpoints[pseudoClass]).toBeUndefined()
      })

      // Add custom style
      const data = mockAddMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, newStyle)
      applySetMixinEntry(site, data)

      // Assert there are still no properties in unspecified pseudo-class after adding
      const resultComponent = resolveComponent(site.context, mixinId)
      nonDefaultPseudoClasses.forEach((pseudoClass) => {
        expect(resultComponent?.style.custom[pseudoClass]).toBeUndefined()
      })
    })

    it('should undo add mixin entry', () => {
      // Add custom style and undo
      const data = mockAddMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, newStyle)
      applySetMixinEntry(site, data)
      undoSetMixinEntry(site, data)

      // Assert style does not exist in mixin
      const newPseudo = getDefaultPseudo(mixinId, CssPseudoClass.Default)
      expect(newPseudo?.[newStyle.property]).toBeUndefined()
    })
  })

  describe('edit mixin entry', () => {
    beforeEach(() => {
      oldStyle = {
        pseudoClass: CssPseudoClass.Hover,
        property: Css.BackgroundColor,
        value: 'red',
      }
      const style = {
        [oldStyle.pseudoClass]: {
          [oldStyle.property]: oldStyle.value,
        },
      }
      const data = mockAddStyleMixinData(mixinId, style)
      mixinId = applyAddStyleMixin(site, data)
    })

    it('should edit mixin entry', () => {
      const newValue = 'blue'

      // Assert old style exists in mixin
      const rawStyle = getDefaultPseudo(mixinId, oldStyle.pseudoClass)
      expect(rawStyle?.[oldStyle.property]).toEqual(oldStyle.value)

      // Update custom style
      const newStyle: IStyleEntry = {
        ...oldStyle,
        value: newValue,
      }
      const data = mockSetMixinEntryData(
        mixinId,
        DEFAULT_BREAKPOINT_ID,
        oldStyle,
        newStyle,
      )
      applySetMixinEntry(site, data)

      // Assert style is updated
      const updatedRawStyle = getDefaultPseudo(mixinId, oldStyle.pseudoClass)
      expect(updatedRawStyle?.[oldStyle.property]).toEqual(newStyle.value)
    })

    it('should undo edit mixin entry', () => {
      // Update custom style and undo
      const newStyle: IStyleEntry = {
        ...oldStyle,
        value: 'blue',
      }
      const data = mockSetMixinEntryData(
        mixinId,
        DEFAULT_BREAKPOINT_ID,
        oldStyle,
        newStyle,
      )
      applySetMixinEntry(site, data)
      undoSetMixinEntry(site, data)

      // Assert style is not modified
      const updatedRawStyle = getDefaultPseudo(mixinId, oldStyle.pseudoClass)
      expect(updatedRawStyle?.[oldStyle.property]).toEqual(oldStyle.value)
    })

    // When a new custom mixin style is added in the editor, it starts with the empty
    // string as its property. This simulates adding and modifying a new style in the editor.
    it('should add and edit empty mixin style', () => {
      const newStyle = {
        pseudoClass: CssPseudoClass.Default,
        property: '' as Css,
        value: '',
      }
      const pseudo = getDefaultPseudo(mixinId, newStyle.pseudoClass)
      expect(pseudo?.[newStyle.property]).toBeUndefined()

      // Add custom style with empty property
      const addData = mockAddMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, newStyle)
      applySetMixinEntry(site, addData)

      // Assert style is added
      const newPseudo = getDefaultPseudo(mixinId, newStyle.pseudoClass)
      expect(newPseudo?.[newStyle.property]).toEqual(newStyle.value)

      // Set empty property to new value
      const editStyle: IStyleEntry = {
        ...newStyle,
        property: Css.Margin,
      }
      const editData = mockSetMixinEntryData(
        mixinId,
        DEFAULT_BREAKPOINT_ID,
        newStyle,
        editStyle,
      )
      applySetMixinEntry(site, editData)

      // Assert empty property no longer exists
      const updatedPseudo = getDefaultPseudo(mixinId, newStyle.pseudoClass)
      expect(updatedPseudo?.[newStyle.property]).toBeUndefined()

      // Assert property is updated, and value is not
      const updatedRawStyle = getDefaultPseudo(mixinId, editStyle.pseudoClass)
      expect(updatedRawStyle?.[editStyle.property]).toEqual(newStyle.value)
    })
  })

  describe('remove mixin entry', () => {
    let style: IStyleEntry

    beforeEach(() => {
      style = {
        pseudoClass: CssPseudoClass.Hover,
        property: Css.BackgroundColor,
        value: 'green',
      }
      const data = mockAddMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, style)
      applySetMixinEntry(site, data)
    })

    it('should remove mixin entry', () => {
      // Assert style exists in mixin
      const oldPseudo = getDefaultPseudo(mixinId, style.pseudoClass)
      expect(oldPseudo?.[style.property]).toEqual(style.value)

      // Remove custom style
      const data = mockRemoveMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, style)
      applySetMixinEntry(site, data)

      // Assert style is removed
      const newPseudo = getDefaultPseudo(mixinId, style.pseudoClass)
      expect(newPseudo?.[style.property]).toBeUndefined()
    })

    it('should undo remove mixin entry', () => {
      // Remove style and undo
      const data = mockRemoveMixinEntryData(mixinId, DEFAULT_BREAKPOINT_ID, style)
      applySetMixinEntry(site, data)
      undoSetMixinEntry(site, data)

      // Assert style still exists in mixin
      const pseudo = getDefaultPseudo(mixinId, style.pseudoClass)
      expect(pseudo?.[style.property]).toEqual(style.value)
    })
  })
})
