import { ComponentArgPrimitive, IComponentInput } from '@pubstudio/shared/type-site'

export const makeInput = (name: string, text: string): IComponentInput => {
  return {
    type: ComponentArgPrimitive.String,
    name,
    attr: true,
    default: '',
    is: text,
  }
}
