import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { Css, CssPseudoClass, IComponent } from '@pubstudio/shared/type-site'

export const makeSetComponentCustomStyle = (
  component: IComponent,
  breakpointId: string,
  prop: Css,
  oldValue: string | undefined,
  value: string,
): ICommand => {
  const pseudoClass = CssPseudoClass.Default
  return {
    type: CommandType.SetComponentCustomStyle,
    data: {
      componentId: component.id,
      breakpointId,
      oldStyle: oldValue ? { pseudoClass, property: prop, value: oldValue } : undefined,
      newStyle: { pseudoClass, property: prop, value },
    },
  }
}
