import {
  IBreakpointStyles,
  IComponentStyle,
  ISerializedComponent,
} from '@pubstudio/shared/type-site'
import { generateCustomStyle } from './detach-component'

// Generate component style for all breakpoints
export const flattenedComponentStyle = (
  component: ISerializedComponent,
): IComponentStyle => {
  const c = component
  const customStyles: IBreakpointStyles = {}
  const mixins: string[] = []
  // Collect mixins
  if (c.style.mixins) {
    mixins.push(...c.style.mixins)
  }
  // Merge custom styles
  for (const breakpointId in c.style.custom) {
    customStyles[breakpointId] = generateCustomStyle(
      customStyles[breakpointId] ?? {},
      c.style.custom[breakpointId],
    )
  }
  return { custom: customStyles, mixins }
}
