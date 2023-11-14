import { setSelectedComponent } from '@pubstudio/frontend/feature-editor'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { ISetComponentInputData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentInput, ISite } from '@pubstudio/shared/type-site'

const removeInput = (component: IComponent, input: IComponentInput | undefined) => {
  if (input && component.inputs) {
    delete component.inputs[input.name]
  }
}

const addInput = (component: IComponent, input: IComponentInput) => {
  if (!component.inputs) {
    component.inputs = {}
  }
  component.inputs[input.name] = input
}

const setInputs = (
  component: IComponent | undefined,
  oldInput: IComponentInput | undefined,
  newInput: IComponentInput | undefined,
) => {
  if (component) {
    // Add or change
    if (newInput !== undefined) {
      removeInput(component, oldInput)
      addInput(component, newInput)
    } else {
      // Remove input
      removeInput(component, oldInput)
    }
    if (component.inputs && Object.values(component.inputs).length === 0) {
      component.inputs = undefined
    }
  }
}

export const applySetComponentInput = (site: ISite, data: ISetComponentInputData) => {
  const { componentId, oldInput, newInput } = data
  const component = resolveComponent(site.context, componentId)
  setInputs(component, oldInput, newInput)
  // Select edited component for redo
  setSelectedComponent(site, component)
}

export const undoSetComponentInput = (site: ISite, data: ISetComponentInputData) => {
  const { componentId, oldInput, newInput } = data
  const component = resolveComponent(site.context, componentId)
  setInputs(component, newInput, oldInput)
  // Select edited component for undo
  setSelectedComponent(site, component)
}
