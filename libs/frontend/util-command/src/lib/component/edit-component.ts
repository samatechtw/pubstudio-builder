import {
  defaultImageInputs,
  defaultLinkInputs,
  resolveComponent,
} from '@pubstudio/frontend/util-builtin'
import {
  IEditComponentData,
  IEditComponentFields,
} from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentInput, ISite, Tag } from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

const addComponentInput = (component: IComponent, input: IComponentInput) => {
  if (!component.inputs) {
    component.inputs = {}
  }
  component.inputs[input.name] = input
}

const addTagInputs = (component: IComponent, fields: IEditComponentFields) => {
  const tag = fields.tag
  if (tag) {
    if (tag === Tag.A && !component.inputs?.['href']) {
      addComponentInput(component, defaultLinkInputs().href)
    } else if (tag === Tag.Img && !component.inputs?.['src']) {
      addComponentInput(component, defaultImageInputs().src)
    }
  }
}

export const applyEditComponent = (site: ISite, data: IEditComponentData) => {
  const context = site.context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: any = resolveComponent(context, data.id)
  for (const key in data.new) {
    component[key] = data.new[key as keyof IEditComponentFields]
  }
  addTagInputs(component, data.new)
  removeTagInputs(component, data.old)
  // Select edited component for redo
  setSelectedComponent(site, component)
}

const removeTagInputs = (component: IComponent, fields: IEditComponentFields) => {
  const tag = fields.tag
  if (tag) {
    if (tag === Tag.A && !component.inputs?.['href']?.is) {
      delete component.inputs?.['href']
    } else if (tag === Tag.Img && !component.inputs?.['src']?.is) {
      delete component.inputs?.['src']
    }
  }
}

export const undoEditComponent = (site: ISite, data: IEditComponentData) => {
  const context = site.context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: any = resolveComponent(context, data.id)
  if (component) {
    for (const key in data.new) {
      component[key] = data.old[key as keyof IEditComponentFields]
    }
    addTagInputs(component, data.old)
    removeTagInputs(component, data.new)
    // Select edited component for undo
    setSelectedComponent(site, component)
  }
}
