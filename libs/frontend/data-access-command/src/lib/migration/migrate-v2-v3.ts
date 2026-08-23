import { clone, mergeStyleOverrides } from '@pubstudio/frontend/util-component'
import { iterateComponent, iterateSite } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  IBehaviorCustomArgs,
  IComponent,
  IComponentStyleOverrides,
  IInstanceOverrides,
  ISite,
} from '@pubstudio/shared/type-site'
import { addComponentHelper } from '../component/add-component'

// v2 mirrored every definition child as an empty "shell" node under each instance, and
// parked the definition on the page it was converted from. See docs/custom-components.md

const hasCustomSource = (context: ISite['context'], component: IComponent): boolean =>
  !!component.customSourceId && !!resolveComponent(context, component.customSourceId)

// Shell edits v3 keeps: content and inputs, plus custom styles as child style overrides
const foldShell = (
  site: ISite,
  shell: IComponent,
  overrides: IInstanceOverrides,
  styleOverrides: IComponentStyleOverrides,
  shellToDefinition: Map<string, string>,
  lost: string[],
) => {
  const definitionId = shell.customSourceId as string
  shellToDefinition.set(shell.id, definitionId)

  // v2 shells were mirrored once, so a definition child deleted later leaves an orphan
  // with nothing to inherit from. v3 expansion is definition-driven, so it disappears.
  if (!resolveComponent(site.context, definitionId)) {
    lost.push(`orphan ${shell.id} (source ${definitionId} no longer exists)`)
  }

  if (shell.content !== undefined || shell.inputs) {
    overrides[definitionId] = {
      content: shell.content,
      inputs: clone(shell.inputs),
    }
  }
  if (Object.keys(shell.style.custom).length) {
    styleOverrides[definitionId] = clone(shell.style.custom)
  }
  if (shell.style.mixins?.length) {
    lost.push(`mixins on ${shell.id}`)
  }
  if (shell.events && Object.keys(shell.events).length) {
    lost.push(`events on ${shell.id}`)
  }
  for (const child of shell.children ?? []) {
    foldShell(site, child, overrides, styleOverrides, shellToDefinition, lost)
  }
}

const foldInstance = (
  site: ISite,
  instance: IComponent,
  shellToDefinition: Map<string, string>,
  lost: string[],
) => {
  const overrides: IInstanceOverrides = clone(instance.instanceOverrides) ?? {}
  const styleOverrides: IComponentStyleOverrides = {}
  for (const child of instance.children ?? []) {
    foldShell(site, child, overrides, styleOverrides, shellToDefinition, lost)
  }
  // Existing overrides are keyed by shell id; re-key to the child the shell stood for.
  // They were the more specific rule in v2, so they win over the shell's own styles.
  const reKeyed: IComponentStyleOverrides = {}
  for (const [selector, styles] of Object.entries(instance.style.overrides ?? {})) {
    reKeyed[shellToDefinition.get(selector) ?? selector] = styles
  }
  const remapped = mergeStyleOverrides(styleOverrides, reKeyed)
  if (Object.keys(overrides).length) {
    instance.instanceOverrides = overrides
  }
  if (remapped && Object.keys(remapped).length) {
    instance.style.overrides = remapped
  }
  const { componentTreeExpandedItems, componentsHidden } = site.editor ?? {}
  iterateComponent(instance.children, (cmp) => {
    delete site.context.components[cmp.id]
    delete componentTreeExpandedItems?.[cmp.id]
    delete componentsHidden?.[cmp.id]
  })
  instance.children = undefined
}

// Shell ids are gone, so behavior args point at the definition child instead, whose
// state changes every instance shares
const remapBehaviorArgs = (
  site: ISite,
  shellToDefinition: Map<string, string>,
  remapped: string[],
) => {
  const remapArgs = (args: IBehaviorCustomArgs | undefined) => {
    for (const [name, value] of Object.entries(args ?? {})) {
      const definitionId =
        typeof value === 'string' ? shellToDefinition.get(value) : undefined
      if (args && definitionId) {
        args[name] = definitionId
        remapped.push(`${value} -> ${definitionId}`)
      }
    }
  }
  const remapComponent = (component: IComponent) => {
    for (const event of Object.values(component.events ?? {})) {
      event.behaviors.forEach((behavior) => remapArgs(behavior.args))
    }
    for (const event of Object.values(component.editorEvents ?? {})) {
      event?.behaviors.forEach((behavior) => remapArgs(behavior.args))
    }
  }
  iterateSite(site, remapComponent)
  for (const id of site.context.customComponentIds) {
    iterateComponent(site.context.components[id], remapComponent)
  }
}

// Each definition leaves the page it was converted from, and an instance takes its place
// so the origin page renders identically
const detachDefinitions = (site: ISite) => {
  const { context } = site
  for (const definitionId of Array.from(context.customComponentIds)) {
    const definition = resolveComponent(context, definitionId)
    const parent = definition?.parent
    if (!definition || !parent) {
      continue
    }
    const parentIndex = parent.children?.findIndex((c) => c.id === definitionId) ?? 0
    parent.children = parent.children?.filter((c) => c.id !== definitionId)
    if (!parent.children?.length) {
      parent.children = undefined
    }
    definition.parent = undefined
    addComponentHelper(site, {
      name: definition.name,
      tag: definition.tag,
      parentId: parent.id,
      parentIndex,
      customComponentId: definitionId,
    })
  }
}

export const migrateV2ToV3 = (site: ISite) => {
  const { context } = site
  const shellToDefinition = new Map<string, string>()
  const lost: string[] = []
  const remapped: string[] = []

  const instances: IComponent[] = []
  const collectInstances = (component: IComponent) => {
    if (component.children?.length && hasCustomSource(context, component)) {
      instances.push(component)
    }
  }
  iterateSite(site, collectInstances)
  for (const id of context.customComponentIds) {
    iterateComponent(context.components[id], collectInstances)
  }
  // Outermost first, so nested instances are folded with their shells still linked
  for (const instance of instances) {
    if (context.components[instance.id]) {
      foldInstance(site, instance, shellToDefinition, lost)
    }
  }
  remapBehaviorArgs(site, shellToDefinition, remapped)
  detachDefinitions(site)

  if (
    site.editor?.selectedComponent &&
    !context.components[site.editor.selectedComponent.id]
  ) {
    site.editor.selectedComponent = undefined
  }
  if (lost.length) {
    console.warn(`Custom instance content dropped by migration: ${lost.join(', ')}`)
  }
  if (remapped.length) {
    console.warn(
      `Behavior args re-pointed at definition children: ${remapped.join(', ')}`,
    )
  }
  console.log(`Completed migration from version ${site.version} to 3`)
  site.version = '3'
}
