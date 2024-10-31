import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { addComponentDataWithSelected } from '@pubstudio/frontend/util-test'
import {
  mockAddComponentCustomStyleData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { CommandType } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { Css, CssPseudoClass, IComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applyCommandGroup, undoCommandGroup } from './command-group'

describe('Command Group', () => {
  let siteString: string
  let site: ISite
  let componentCount: number

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    componentCount = Object.keys(site.context.components).length
  })

  it('add a component and set its style', () => {
    const newCmp = mockSerializedComponent(site)

    const cmpData = addComponentDataWithSelected(newCmp, site.editor)
    const styleData = mockAddComponentCustomStyleData(newCmp.id, DEFAULT_BREAKPOINT_ID, {
      pseudoClass: CssPseudoClass.Default,
      property: Css.BackgroundColor,
      value: 'red',
    })
    const groupData: ICommandGroupData = {
      commands: [
        { type: CommandType.AddComponent, data: cmpData },
        { type: CommandType.SetComponentCustomStyle, data: styleData },
      ],
    }
    applyCommandGroup(site, groupData)
    const addedCmp = site.pages['/home']?.root.children?.[0]?.children?.[0]
    const newComponentCount = Object.keys(site.context.components).length

    expect(addedCmp).toBeDefined()
    expect(newComponentCount).toEqual(componentCount + 1)
    expect(addedCmp?.id).toEqual(newCmp.id)
    expect(addedCmp?.name).toEqual(newCmp.name)
    expect(addedCmp?.id).toEqual(newCmp.id)
    expect(addedCmp?.style.mixins).toEqual(newCmp.style.mixins)
    expect(addedCmp?.parent?.id).toEqual(newCmp.parentId)
    expect(
      addedCmp?.style.custom[DEFAULT_BREAKPOINT_ID]?.default?.[Css.BackgroundColor],
    ).toEqual('red')

    // Undo command group
    undoCommandGroup(site, groupData)

    expect(site.pages).toEqual(deserializeSite(siteString)?.pages)
  })

  it('add sets the style of multiple components and undo', () => {
    // Add a component, so the site has 2 components
    const newCmp = mockSerializedComponent(site)
    const cmpData = addComponentDataWithSelected(newCmp, site.editor)
    applyAddComponent(site, cmpData)
    const addedCmp = site.pages['/home']?.root.children?.[0]?.children?.[0]
    const root = site.pages['/home'].root.children?.[0] as IComponent
    const oldRootStyle = { ...root.style.custom[DEFAULT_BREAKPOINT_ID]?.default }
    const oldCmpStyle = { ...addedCmp?.style.custom[DEFAULT_BREAKPOINT_ID]?.default }

    const styleData1 = mockAddComponentCustomStyleData(root.id, DEFAULT_BREAKPOINT_ID, {
      pseudoClass: CssPseudoClass.Default,
      property: Css.Position,
      value: 'relative',
    })
    const styleData2 = mockAddComponentCustomStyleData(newCmp.id, DEFAULT_BREAKPOINT_ID, {
      pseudoClass: CssPseudoClass.Default,
      property: Css.BackgroundColor,
      value: 'red',
    })
    const groupData: ICommandGroupData = {
      commands: [
        { type: CommandType.SetComponentCustomStyle, data: styleData1 },
        { type: CommandType.SetComponentCustomStyle, data: styleData2 },
      ],
    }
    applyCommandGroup(site, groupData)

    expect(
      addedCmp?.style.custom[DEFAULT_BREAKPOINT_ID]?.default?.[Css.BackgroundColor],
    ).toEqual('red')
    expect(root.style.custom[DEFAULT_BREAKPOINT_ID]?.default?.[Css.Position]).toEqual(
      'relative',
    )

    // Undo group command
    undoCommandGroup(site, groupData)

    expect(addedCmp?.style.custom[DEFAULT_BREAKPOINT_ID]?.default).toEqual(oldCmpStyle)
    expect(root.style.custom[DEFAULT_BREAKPOINT_ID]?.default).toEqual(oldRootStyle)
  })
})
