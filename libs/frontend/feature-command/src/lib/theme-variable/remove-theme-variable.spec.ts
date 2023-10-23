import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISite, IThemeVariable } from '@pubstudio/shared/type-site'
import {
  mockRemoveThemeVariableData,
  mockSerializedSite,
} from '@pubstudio/web/util-test-mock'
import { applyAddThemeVariable } from './add-theme-variable'
import {
  applyRemoveThemeVariable,
  undoRemoveThemeVariable,
} from './remove-theme-variable'

describe('Remove Theme Variable', () => {
  let siteString: string
  let site: ISite
  let themeVariableToBeRemoved: IThemeVariable

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    themeVariableToBeRemoved = {
      key: 'my-color',
      value: '#000000',
      isColor: true,
    }
    applyAddThemeVariable(site, {
      key: themeVariableToBeRemoved.key,
      value: themeVariableToBeRemoved.value,
    })
  })

  it('should remove theme variable in site', () => {
    // Assert theme variable exists before removing
    expect(themeVariableToBeRemoved.key in site.context.theme.variables).toEqual(true)

    // Remove theme variable
    const data = mockRemoveThemeVariableData(
      themeVariableToBeRemoved.key,
      themeVariableToBeRemoved.value,
    )
    applyRemoveThemeVariable(site, data)

    // Assert theme variable is removed
    expect(themeVariableToBeRemoved.key in site.context.theme.variables).toEqual(false)
  })

  it('should undo remove theme variable', () => {
    // Remove theme variable and undo
    const data = mockRemoveThemeVariableData(
      themeVariableToBeRemoved.key,
      themeVariableToBeRemoved.value,
    )
    applyRemoveThemeVariable(site, data)
    undoRemoveThemeVariable(site, data)

    // Assert theme variable is removed
    expect(site.context.theme.variables[themeVariableToBeRemoved.key]).toEqual(
      themeVariableToBeRemoved.value,
    )
  })
})
