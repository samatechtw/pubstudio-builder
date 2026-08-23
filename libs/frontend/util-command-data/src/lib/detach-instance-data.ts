import {
  clone,
  mergeBreakpointStyles,
  mergeStyleOverrides,
} from '@pubstudio/frontend/util-component'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  IAddComponentChildData,
  IAddComponentData,
  IDetachInstanceData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, IInstanceOverrides, ISite } from '@pubstudio/shared/type-site'
import { makeRemoveComponentData } from './remove-component-data'

const materializeChild = (
  def: IComponent,
  overrides: IInstanceOverrides | undefined,
): IAddComponentChildData => {
  const override = overrides?.[def.id]
  return {
    name: def.name,
    tag: def.tag,
    role: def.role,
    content: override?.content ?? def.content,
    style: clone(def.style),
    state: clone(def.state),
    inputs: { ...clone(def.inputs), ...clone(override?.inputs) },
    events: clone(def.events),
    editorEvents: clone(def.editorEvents),
    // A nested instance stays an instance of its own definition
    customComponentId: def.customSourceId,
    children: def.children?.map((child) => materializeChild(child, overrides)),
  }
}

// An independent copy of what the instance resolves to today. Child override style keys
// still reference definition child ids; applyDetachInstance remaps them.
export const makeDetachInstanceData = (
  site: ISite,
  instance: IComponent,
): IDetachInstanceData | undefined => {
  const def = resolveComponent(site.context, instance.customSourceId)
  const parent = instance.parent
  if (!def || !parent) {
    return undefined
  }
  const parentIndex = parent.children?.findIndex((c) => c.id === instance.id) ?? 0
  const mixins = Array.from(
    new Set([...(def.style.mixins ?? []), ...(instance.style.mixins ?? [])]),
  )
  const replacement: IAddComponentData = {
    name: instance.name,
    tag: def.tag,
    role: instance.role ?? def.role,
    content: instance.content ?? def.content,
    parentId: parent.id,
    parentIndex,
    state: clone(instance.state ?? def.state),
    inputs: { ...clone(def.inputs), ...clone(instance.inputs) },
    events: { ...clone(def.events), ...clone(instance.events) },
    editorEvents: { ...clone(def.editorEvents), ...clone(instance.editorEvents) },
    style: {
      custom: mergeBreakpointStyles(def.style.custom, instance.style.custom),
      mixins: mixins.length ? mixins : undefined,
      overrides: mergeStyleOverrides(def.style.overrides, instance.style.overrides),
    },
    children: def.children?.map((child) =>
      materializeChild(child, instance.instanceOverrides),
    ),
  }
  return { instance: makeRemoveComponentData(site, instance), replacement }
}
