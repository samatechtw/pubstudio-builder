import {
  makeAddBuiltinStyleMixin,
  pushCommand,
} from '@pubstudio/frontend/data-access-command'
import { getActivePage } from '@pubstudio/frontend/feature-site-store'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'
import { builtinBehaviors, getBuiltinComponent } from '@pubstudio/frontend/util-builtin'
import {
  makeAddBuiltinComponentData,
  makeAddCustomComponentData,
  makeAddImageData,
  makeAddLinkData,
} from '@pubstudio/frontend/util-command-data'
import { clone } from '@pubstudio/frontend/util-component'
import {
  resolveBehavior,
  resolveComponent,
  resolveStyle,
} from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentData,
  ICommandGroupData,
  ISetBehaviorData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

// Get builtin mixins and behaviors from a component & children that have not
// been added to the site
const getMissingBuiltinFields = (
  site: ISite,
  componentId: string | undefined,
): IMissingComponentFields => {
  const builtinComponent = getBuiltinComponent(componentId)
  if (!builtinComponent) {
    return { mixinIds: [], behaviorIds: [] }
  }
  return getMissingComponentFields(site, builtinComponent)
}

const removeDuplicates = (arr: string[]): string[] => {
  return Array.from(new Set(arr))
}

interface IMissingComponentFields {
  mixinIds: string[]
  behaviorIds: string[]
}
export const getMissingComponentFields = (
  site: ISite,
  component: IComponent,
): IMissingComponentFields => {
  // Iterate component/children and get mixins
  const stack = [component]
  let mixins: string[] = []
  let behaviors: string[] = []
  while (stack.length > 0) {
    const cmp = stack.pop()
    if (cmp?.style.mixins) {
      mixins = [...mixins, ...cmp.style.mixins]
    }
    if (cmp?.events) {
      for (const event of Object.values(cmp.events)) {
        behaviors = [...behaviors, ...event.behaviors.map((b) => b.behaviorId)]
      }
    }
    if (cmp?.children) {
      stack.push(...cmp.children)
    }
  }
  return {
    mixinIds: removeDuplicates(mixins.filter((id) => !resolveStyle(site.context, id))),
    behaviorIds: removeDuplicates(
      behaviors.filter((id) => !resolveBehavior(site.context, id)),
    ),
  }
}

export interface IAddComponentOptions {
  id: string
  parentId?: string
  parentIndex?: number
  content?: string
}

export const addBuiltinComponentData = (site: ISite, data: IAddComponentData) => {
  const missing = getMissingBuiltinFields(site, data.sourceId)
  pushCommandWithBuiltins(site, CommandType.AddComponent, data, missing)
}

export const addCustomComponentData = (site: ISite, data: IAddComponentData) => {
  pushCommand(site, CommandType.AddComponent, data)
}

export const addComponentToParent = (
  site: ISite,
  options: IAddComponentOptions,
  addData: (parent: IComponent) => IAddComponentData | undefined,
): IAddComponentData | undefined => {
  const activePage = getActivePage(site)
  if (!activePage) {
    return
  }
  const { parentId, parentIndex } = options

  let parent: IComponent | undefined
  if (parentId) {
    parent = resolveComponent(site.context, parentId)
  }
  parent = parent ?? site.editor?.selectedComponent ?? activePage.root

  const data = addData(parent)
  if (data) {
    if (parentIndex) {
      data.parentIndex = parentIndex
    }
  }
  return data
}

export const addCustomComponent = (site: ISite, options: IAddComponentOptions) => {
  const data = addComponentToParent(site, options, (parent) =>
    makeAddCustomComponentData(
      site,
      options.id,
      parent,
      site.editor?.selectedComponent?.id,
    ),
  )
  if (data) {
    addCustomComponentData(site, data)
  }
  return data?.id
}

export const addBuiltinComponent = (
  site: ISite,
  options: IAddComponentOptions,
): string | undefined => {
  const data = addComponentToParent(site, options, (parent) =>
    makeAddBuiltinComponentData(options.id, parent, site.editor?.selectedComponent?.id),
  )
  if (data) {
    addBuiltinComponentData(site, data)
  }
  return data?.id
}

export const addDroppedComponent = (
  site: ISite,
  dragType: BuilderDragDataType,
  options: IAddComponentOptions,
): string | undefined => {
  const data = addComponentToParent(site, options, (parent) => {
    if (dragType === BuilderDragDataType.LinkAsset) {
      return makeAddLinkData(site, parent, {
        src: options.id,
        openInNewTab: true,
        text: options.content ?? 'Link Text',
      })
    } else {
      return makeAddImageData(site, parent, options.id)
    }
  })
  if (data) {
    addBuiltinComponentData(site, data)
  }
  return data?.id
}

export interface IPushCommandWithBuiltins {
  mixinIds?: string[]
  behaviorIds?: string[]
}

export const pushCommandWithBuiltins = <Data>(
  site: ISite,
  type: CommandType,
  data: Data,
  builtins: IPushCommandWithBuiltins,
) => {
  const commands: ICommand[] = [{ type, data }]

  builtins.mixinIds?.forEach((mixinId) => {
    const styleCmd = makeAddBuiltinStyleMixin(site.context, mixinId)
    if (styleCmd) {
      commands.push(styleCmd)
    }
  })
  builtins.behaviorIds?.forEach((behaviorId) => {
    const behavior = builtinBehaviors[behaviorId]
    const alreadyExists = !!resolveBehavior(site.context, behaviorId)
    if (!alreadyExists) {
      const addBehaviorData: ISetBehaviorData = {
        newBehavior: clone(behavior),
      }
      commands.push({
        type: CommandType.SetBehavior,
        data: addBehaviorData,
      })
    }
  })

  pushCommand(site, CommandType.Group, { commands } as ICommandGroupData)
}
