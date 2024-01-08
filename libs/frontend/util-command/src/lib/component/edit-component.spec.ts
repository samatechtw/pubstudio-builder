import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { IEditComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { applyEditComponent, undoEditComponent } from './edit-component'

describe('Remove Component', () => {
  let siteString: string
  let site: ISite
  const getComponent = () => site.pages['/home'].root.children?.[0] as IComponent
  let component: IComponent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    component = getComponent()
  })

  it('should edit component name and undo', () => {
    const name = '__NEW_CMP_NAME__'
    const editComponentData: IEditComponentData = {
      id: component.id,
      new: { name },
      old: { name: component.name },
    }
    applyEditComponent(site, editComponentData)

    expect(getComponent().name).toEqual(name)

    undoEditComponent(site, editComponentData)
    expect(getComponent()).toEqual(component)
  })

  it('should edit component tag and undo', () => {
    const tag = Tag.A
    const editComponentData: IEditComponentData = {
      id: component.id,
      new: { tag },
      old: { tag: component.tag },
    }
    applyEditComponent(site, editComponentData)

    expect(getComponent().tag).toEqual(tag)

    undoEditComponent(site, editComponentData)
    expect(getComponent()).toEqual(component)
  })

  it('should edit component content', () => {
    const content = 'SOME NEW CONTENT'
    const editComponentData: IEditComponentData = {
      id: component.id,
      new: { content },
      old: { content: component.content },
    }
    applyEditComponent(site, editComponentData)

    expect(getComponent().content).toEqual(content)

    undoEditComponent(site, editComponentData)
    expect(getComponent()).toEqual(component)
  })

  it('should edit all possible component fields', () => {
    const content = 'SOME NEW CONTENT'
    const tag = Tag.A
    const name = '__NEW_CMP_NAME__'
    const editComponentData: IEditComponentData = {
      id: component.id,
      new: { content, tag, name },
      old: {
        content: component.content,
        tag: component.tag,
        name: component.name,
      },
    }
    applyEditComponent(site, editComponentData)

    expect(getComponent().content).toEqual(content)
    expect(getComponent().tag).toEqual(tag)
    expect(getComponent().name).toEqual(name)

    undoEditComponent(site, editComponentData)
    expect(getComponent()).toEqual(component)
  })
})
