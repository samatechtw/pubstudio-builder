import { IBreakpoint } from './i-breakpoint'
import { IBehavior, IComponent } from './i-component'
import { IStyle } from './i-style'
import { ITheme } from './i-theme'

export interface ISiteContext {
  namespace: string
  nextId: number
  components: Record<string, IComponent>
  styles: Record<string, IStyle>
  behaviors: Record<string, IBehavior>
  theme: ITheme
  breakpoints: Record<string, IBreakpoint>
}
