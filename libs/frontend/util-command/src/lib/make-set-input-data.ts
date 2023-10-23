import { ISetComponentInputData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentInput } from '@pubstudio/shared/type-site'

export const makeSetInputData = (
  component: IComponent | undefined,
  property: string,
  payload: Partial<IComponentInput>,
): ISetComponentInputData | undefined => {
  const oldInput = component?.inputs?.[property]
  const newInput = {
    ...oldInput,
    ...payload,
  } as IComponentInput
  if (!component || equal(oldInput, newInput)) {
    return
  }
  const data: ISetComponentInputData = {
    componentId: component.id,
    oldInput,
    newInput,
  }
  return data
}

const equal = (
  oldInput: IComponentInput | undefined,
  newInput: IComponentInput,
): boolean => {
  if (!oldInput) {
    return false
  }
  const oldKeys = Object.keys(oldInput)
  const newKeys = Object.keys(newInput)
  return (
    oldKeys.length === newKeys.length &&
    oldKeys.every((key) => {
      const castedKey = key as keyof IComponentInput
      return oldInput[castedKey] === newInput[castedKey]
    })
  )
}
