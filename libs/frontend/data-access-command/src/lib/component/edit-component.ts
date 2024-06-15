import { defaultImageInputs, defaultLinkInputs } from '@pubstudio/frontend/util-builtin'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
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

const addTagInputs = (
  site: ISite,
  component: IComponent,
  fields: IEditComponentFields,
) => {
  const tag = fields.tag
  const customCmp = resolveComponent(site.context, component.customSourceId)
  const mergedInputs = {
    ...customCmp?.inputs,
    ...component.inputs,
  }
  if (tag) {
    if (tag === Tag.A && !mergedInputs.href) {
      addComponentInput(component, defaultLinkInputs().href)
    } else if (tag === Tag.Img && !mergedInputs.src) {
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
  addTagInputs(site, component, data.new)
  removeTagInputs(site, component, data.old)
  // Select edited component for redo
  setSelectedComponent(site, component)
}

const removeTagInputs = (
  site: ISite,
  component: IComponent,
  fields: IEditComponentFields,
) => {
  const tag = fields.tag
  const customCmp = resolveComponent(site.context, component.customSourceId)
  const mergedInputs = {
    ...customCmp?.inputs,
    ...component.inputs,
  }
  if (tag) {
    if (tag === Tag.A && !mergedInputs.href?.is) {
      delete component.inputs?.['href']
    } else if (tag === Tag.Img && !mergedInputs.src?.is) {
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
    addTagInputs(site, component, data.old)
    removeTagInputs(site, component, data.new)
    // Select edited component for undo
    setSelectedComponent(site, component)
  }
}
