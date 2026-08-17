import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { IComponent, ISerializedComponent, IStyle } from '@pubstudio/shared/type-site'
import { ComponentInclude } from './input'

export const MAX_CONTENT_CHARS = 200
export const MAX_TREE_NODES = 400

const truncate = (text: string, max = MAX_CONTENT_CHARS): string =>
  text.length > max ? `${text.slice(0, max)}…` : text

// One line per component: `<id> <tag> "<name>" [mixins: …] "content"`
const treeLine = (component: IComponent, depth: number): string => {
  const parts = [`${'  '.repeat(depth)}${component.id} ${component.tag}`]
  if (component.name && component.name !== component.id) {
    parts.push(`"${component.name}"`)
  }
  if (component.style.mixins?.length) {
    parts.push(`[mixins: ${component.style.mixins.join(' ')}]`)
  }
  if (component.customSourceId) {
    parts.push(`[custom: ${component.customSourceId}]`)
  }
  if (component.content) {
    parts.push(`'${truncate(component.content.replace(/\s+/g, ' '), 60)}'`)
  }
  return parts.join(' ')
}

export interface ITreeResult {
  tree: string
  nodes: number
  truncated?: boolean
  hint?: string
}

export const componentTree = (
  root: IComponent,
  maxDepth: number,
  maxNodes = MAX_TREE_NODES,
): ITreeResult => {
  const lines: string[] = []
  let truncated = false

  const walk = (component: IComponent, depth: number) => {
    if (lines.length >= maxNodes) {
      truncated = true
      return
    }
    lines.push(treeLine(component, depth))
    if (depth >= maxDepth) {
      if (component.children?.length) {
        truncated = true
        lines.push(`${'  '.repeat(depth + 1)}… ${component.children.length} more`)
      }
      return
    }
    component.children?.forEach((child) => walk(child, depth + 1))
  }
  walk(root, 0)

  return {
    tree: lines.join('\n'),
    nodes: lines.length,
    ...(truncated
      ? {
          truncated: true,
          hint: 'Narrow with read({tree:{componentId:"…"}}) or raise depth.',
        }
      : {}),
  }
}

// Cycle-safe component view; `IComponent.parent` makes the live object unserializable
export const componentView = (
  component: IComponent,
  include: ComponentInclude[],
): Partial<ISerializedComponent> => {
  const serialized = serializeComponent(component)
  const view: Partial<ISerializedComponent> = {
    id: serialized.id,
    name: serialized.name,
    tag: serialized.tag,
    role: serialized.role,
    parentId: serialized.parentId,
    customSourceId: serialized.customSourceId,
  }
  if (serialized.content) {
    view.content = truncate(serialized.content)
  }
  if (include.includes('style')) {
    view.style = { custom: serialized.style.custom, mixins: serialized.style.mixins }
  }
  if (include.includes('overrides') && serialized.style.overrides) {
    view.style = {
      ...(view.style ?? { custom: {} }),
      overrides: serialized.style.overrides,
    }
  }
  if (include.includes('inputs')) {
    view.inputs = serialized.inputs
  }
  if (include.includes('events')) {
    view.events = serialized.events
  }
  if (include.includes('editorEvents')) {
    view.editorEvents = serialized.editorEvents
  }
  if (include.includes('state')) {
    view.state = serialized.state
  }
  if (include.includes('children')) {
    view.children = serialized.children
  }
  return view
}

export interface IComponentMatch {
  id: string
  tag: string
  name: string
  page?: string
  content?: string
}

export const componentSummary = (
  component: IComponent,
  page: string | undefined,
): IComponentMatch => ({
  id: component.id,
  tag: component.tag,
  name: component.name,
  page,
  content: component.content ? truncate(component.content, 60) : undefined,
})

export const mixinSummary = (mixin: IStyle) => ({
  id: mixin.id,
  name: mixin.name,
  breakpoints: Object.keys(mixin.breakpoints),
})
