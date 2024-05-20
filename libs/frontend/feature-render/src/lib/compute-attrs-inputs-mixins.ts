import { RenderMode } from '@pubstudio/frontend/util-render'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import {
  CssPseudoClass,
  IComponent,
  IEditorContext,
  ISiteContext,
  Tag,
} from '@pubstudio/shared/type-site'
import { IAttrsInputsMixins } from './i-attrs-inputs-mixins'
import { pseudoClassToCssClass } from './pseudo-class-to-css-class'

export interface IComputeAttrsInputsMixinsOptions {
  renderMode: RenderMode
  /**
   * @default true
   */
  resolveTheme?: boolean
  editor?: IEditorContext
}

export const resolveInput = (
  context: ISiteContext,
  value: unknown,
  resolveTheme = true,
): unknown => {
  if (resolveTheme && typeof value === 'string') {
    return resolveThemeVariables(context, value, false) ?? value
  } else {
    return value
  }
}

// Compute component attributes/props, inputs, and mixins
// TODO -- return correct input/attr type instead of `unknown`
export const computeAttrsInputsMixins = (
  context: ISiteContext,
  component: IComponent,
  options: IComputeAttrsInputsMixinsOptions,
): IAttrsInputsMixins => {
  const { renderMode, resolveTheme = true, editor } = options

  const c: IComponent = component
  const attrs: Record<string, unknown> = {}
  const mixins: string[] = []

  if (editor) {
    const { cssPseudoClass } = editor
    if (cssPseudoClass !== CssPseudoClass.Default) {
      mixins.push(pseudoClassToCssClass(cssPseudoClass))
    }
  }
  // Collect mixins
  if (c.style.mixins) {
    mixins.push(...c.style.mixins)
  }
  // Add attrs and inputs from default `inputs`
  for (const [key, input] of Object.entries(c.inputs ?? {})) {
    if (input.attr) {
      attrs[key] = resolveInput(context, input.is ?? input.default, resolveTheme)
    }
  }
  // Add role
  if (!attrs.role && c.role) {
    attrs.role = c.role
  }

  if (component.tag === Tag.A && attrs.href && renderMode === RenderMode.Release) {
    attrs.href = attrs.href?.toString()
  }

  return { attrs, mixins }
}
