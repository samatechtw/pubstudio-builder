import { IBreakpoint } from './i-breakpoint'
import { IBehavior, IComponent } from './i-component'
import { IGlobalStyle, IStyle } from './i-style'
import { ITheme } from './i-theme'

export type ITranslations = Record<string, string>

export interface ISiteContext {
  namespace: string
  nextId: number
  components: Record<string, IComponent>
  globalStyles: Record<string, IGlobalStyle>
  styles: Record<string, IStyle>
  styleOrder: string[]
  customComponentIds: Set<string>
  customChildIds: Set<string>
  behaviors: Record<string, IBehavior>
  theme: ITheme
  breakpoints: Record<string, IBreakpoint>
  i18n: Record<string, ITranslations>
  activeI18n?: string
}
