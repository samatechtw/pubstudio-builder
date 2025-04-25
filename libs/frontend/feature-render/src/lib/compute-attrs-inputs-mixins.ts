import { computeInputs, RenderMode } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, IEditorContext, ISiteContext } from '@pubstudio/shared/type-site'
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

// Compute component attributes/props, inputs, and mixins
// TODO -- return correct input/attr type instead of `unknown`
export const computeAttrsInputsMixins = (
  context: ISiteContext,
  component: IComponent,
  options: IComputeAttrsInputsMixinsOptions,
): IAttrsInputsMixins => {
  const { renderMode, resolveTheme = true, editor } = options

  const isCustom =
    context.customComponentIds.has(component.id) ||
    context.customChildIds.has(component.id)

  const c: IComponent = component
  let r: IComponent | undefined = undefined
  const mixins: string[] = []

  if (component.customSourceId) {
    r = resolveComponent(context, c.customSourceId)
    mixins.push(component.customSourceId)
  }
  const content = c.content ?? r?.content

  if (editor) {
    const { cssPseudoClass } = editor
    if (cssPseudoClass !== 'default') {
      mixins.push(pseudoClassToCssClass(cssPseudoClass))
    }
  }
  // Custom component mixins are merged into component style
  if (!isCustom && c.style.mixins) {
    mixins.push(...c.style.mixins)
  }
  const attrs = computeInputs(context, component, r, { resolveTheme, onlyAttrs: true })

  // Add role
  if (!attrs.role) {
    if (r?.role) {
      attrs.role = r.role
    }
    if (c.role) {
      attrs.role = c.role
    }
  }

  if (component.tag === 'a' && attrs.href && renderMode === RenderMode.Release) {
    attrs.href = attrs.href?.toString()
  }

  return { content, attrs, mixins }
}
