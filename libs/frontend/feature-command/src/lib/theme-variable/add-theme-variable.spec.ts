import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISite, IThemeVariable } from '@pubstudio/shared/type-site'
import {
  mockAddThemeVariableData,
  mockSerializedSite,
} from '@pubstudio/web/util-test-mock'
import { applyAddThemeVariable, undoAddThemeVariable } from './add-theme-variable'

describe('Add Theme Variable', () => {
  let siteString: string
  let site: ISite
  let themeVariable: IThemeVariable

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    themeVariable = {
      key: 'my-color',
      value: '#000000',
      isColor: true,
    }
  })

  it('should add theme variable to site', () => {
    // Assert theme variable with the same key does not exist in site context before adding
    expect(themeVariable.key in site.context.theme.variables).toEqual(false)

    // Add theme variable
    const data = mockAddThemeVariableData(themeVariable.key, themeVariable.value)
    applyAddThemeVariable(site, data)

    // Assert theme variable is added
    expect(site.context.theme.variables[themeVariable.key]).toEqual(themeVariable.value)
  })

  it('should undo add theme variable', () => {
    // Add theme variable and undo
    const data = mockAddThemeVariableData(themeVariable.key, themeVariable.value)
    applyAddThemeVariable(site, data)
    undoAddThemeVariable(site, data)

    // Assert theme variable is removed
    expect(themeVariable.key in site.context.theme.variables).toEqual(false)
  })
})
