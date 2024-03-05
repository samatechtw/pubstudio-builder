import { IBreakpoint } from './i-breakpoint'
import { IBehavior, IComponent } from './i-component'
import { IReusableComponent } from './i-reusable-component'
import { IStyle } from './i-style'
import { ITheme } from './i-theme'

export type ITranslations = Record<string, string>

export interface ISiteContext {
  namespace: string
  nextId: number
  components: Record<string, IComponent>
  reusableComponents: Record<string, IReusableComponent>
  styles: Record<string, IStyle>
  behaviors: Record<string, IBehavior>
  theme: ITheme
  breakpoints: Record<string, IBreakpoint>
  i18n: Record<string, ITranslations>
  activeI18n?: string
}
