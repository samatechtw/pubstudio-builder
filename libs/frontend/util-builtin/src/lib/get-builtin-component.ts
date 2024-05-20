import { IComponent } from '@pubstudio/shared/type-site'
import { builtinComponents } from './components/builtin-components'

export const getBuiltinComponent = (
  builtinId: string | undefined,
): IComponent | undefined => {
  if (!builtinId) {
    return undefined
  }
  return builtinComponents[builtinId]
}
