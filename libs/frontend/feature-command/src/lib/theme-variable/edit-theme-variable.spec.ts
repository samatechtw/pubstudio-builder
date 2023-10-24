import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockEditThemeVariableData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { ISite, IThemeVariable } from '@pubstudio/shared/type-site'
import { applyAddThemeVariable } from './add-theme-variable'
import { applyEditThemeVariable, undoEditThemeVariable } from './edit-theme-variable'

describe('Edit Theme Variable', () => {
  let siteString: string
  let site: ISite
  let oldThemeVariable: IThemeVariable
  let newThemeVariable: IThemeVariable

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Prepare old theme variable
    oldThemeVariable = {
      key: 'my-color',
      value: '#000000',
      isColor: true,
    }
    applyAddThemeVariable(site, {
      key: oldThemeVariable.key,
      value: oldThemeVariable.value,
    })

    // Prepare new theme variable
    newThemeVariable = {
      key: oldThemeVariable.key,
      value: '123',
      isColor: false,
    }
  })

  it('should edit theme variable in site', () => {
    // Edit theme variable
    const data = mockEditThemeVariableData(oldThemeVariable, newThemeVariable)
    applyEditThemeVariable(site, data)

    // Assert theme variable is edited
    expect(site.context.theme.variables[oldThemeVariable.key]).toEqual(
      newThemeVariable.value,
    )
  })

  it('should undo edit theme variable', () => {
    // Edit theme variable and undo
    const data = mockEditThemeVariableData(oldThemeVariable, newThemeVariable)
    applyEditThemeVariable(site, data)
    undoEditThemeVariable(site, data)

    // Assert theme variable is removed
    expect(site.context.theme.variables[oldThemeVariable.key]).toEqual(
      oldThemeVariable.value,
    )
  })
})
