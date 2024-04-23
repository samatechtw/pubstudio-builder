import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISetGlobalStyleData } from '@pubstudio/shared/type-command-data'
import { IGlobalStyle, ISite } from '@pubstudio/shared/type-site'
import { applySetGlobalStyle, undoSetGlobalStyle } from './set-global-style'

describe('Set Global Style', () => {
  let siteString: string
  let site: ISite
  let name: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    name = 'test'
  })

  const addGlobalStyle = (): ISetGlobalStyleData => {
    const newStyle: IGlobalStyle = {
      style: '@keyframes test {}',
    }

    // Add global style
    const data: ISetGlobalStyleData = {
      name,
      newStyle,
    }
    applySetGlobalStyle(site, data)

    return data
  }

  it('add global style and undo', () => {
    const data = addGlobalStyle()

    // Assert style is added
    const style = site.context.globalStyles[name]
    expect(style).toEqual(data.newStyle)

    // Undo
    undoSetGlobalStyle(site, data)

    // Assert style is removed
    expect(site.context.globalStyles).toEqual({})
  })

  it('should edit global style data and undo', () => {
    const addData = addGlobalStyle()

    const newStyle: IGlobalStyle = {
      style: '.app { color: red; }',
    }

    // Add global style
    const data: ISetGlobalStyleData = {
      name,
      oldStyle: addData.newStyle,
      newStyle,
    }
    applySetGlobalStyle(site, data)

    // Assert style is changed
    expect(site.context.globalStyles[name]).toEqual(newStyle)

    // Undo
    undoSetGlobalStyle(site, data)

    // Assert style is removed
    expect(site.context.globalStyles[name]).toEqual(addData.newStyle)
  })

  it('should edit global style name and undo', () => {
    const addData = addGlobalStyle()
    const newName = 'NEW_NAME'

    // Add global style
    const data: ISetGlobalStyleData = {
      name,
      newName,
    }
    applySetGlobalStyle(site, data)

    // Assert style is renamed
    expect(site.context.globalStyles[name]).toBeUndefined()
    expect(site.context.globalStyles[newName]).toEqual(addData.newStyle)

    // Undo
    undoSetGlobalStyle(site, data)

    // Assert style is name is reverted
    expect(site.context.globalStyles[name]).toEqual(addData.newStyle)
    expect(site.context.globalStyles[newName]).toBeUndefined()
  })

  it('should edit global style name/data and undo', () => {
    const addData = addGlobalStyle()
    const oldStyle = addData.newStyle
    const newName = 'NEW_NAME'
    const newStyle: IGlobalStyle = {
      style: '.app { color: red; }',
    }

    // Add global style
    const data: ISetGlobalStyleData = {
      name,
      newName,
      oldStyle,
      newStyle,
    }
    applySetGlobalStyle(site, data)

    // Assert style is renamed and data is updated
    expect(site.context.globalStyles[name]).toBeUndefined()
    expect(site.context.globalStyles[newName]).toEqual(newStyle)

    // Undo
    undoSetGlobalStyle(site, data)

    // Assert style is name is reverted
    expect(site.context.globalStyles[name]).toEqual(oldStyle)
    expect(site.context.globalStyles[newName]).toBeUndefined()
  })

  it('should remove global style', () => {
    const addData = addGlobalStyle()

    // Add global style
    const data: ISetGlobalStyleData = {
      name,
      oldStyle: addData.newStyle,
      newStyle: undefined,
    }
    applySetGlobalStyle(site, data)

    // Assert style is removed
    expect(site.context.globalStyles[name]).toBeUndefined()

    // Undo
    undoSetGlobalStyle(site, data)

    // Assert style is name is reverted
    expect(site.context.globalStyles[name]).toEqual(addData.newStyle)
  })
})
