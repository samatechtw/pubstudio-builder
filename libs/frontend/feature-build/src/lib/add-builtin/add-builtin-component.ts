import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { getActivePage } from '@pubstudio/frontend/feature-site-store'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'
import { builtinStyles, getBuiltinComponent } from '@pubstudio/frontend/util-builtin'
import {
  makeAddBuiltinComponentData,
  makeAddCustomComponentData,
  makeAddImageData,
  makeAddLinkData,
} from '@pubstudio/frontend/util-command-data'
import { resolveComponent, resolveStyle } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentData,
  IAddStyleMixinData,
  ICommandGroupData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

// Get builtin mixins from a component & children that have not
// been added to the site
const getMissingMixins = (componentId: string | undefined): string[] => {
  const builtinComponent = getBuiltinComponent(componentId)
  if (!builtinComponent) {
    return []
  }
  // Iterate component/children and get mixins
  const stack = [builtinComponent]
  let mixins: string[] = []
  while (stack.length > 0) {
    const cmp = stack.pop()
    if (cmp?.style.mixins) {
      mixins = [...mixins, ...cmp.style.mixins]
    }
    if (cmp?.children) {
      stack.push(...cmp.children)
    }
  }
  return mixins
}

export interface IAddComponentOptions {
  id: string
  parentId?: string
  parentIndex?: number
  content?: string
}

export const addBuiltinComponentData = (site: ISite, data: IAddComponentData) => {
  const mixins = getMissingMixins(data.sourceId)
  pushCommandAndAddMissingMixins(site, CommandType.AddComponent, data, mixins)
}

export const addCustomComponentData = (site: ISite, data: IAddComponentData) => {
  pushCommand(site, CommandType.AddComponent, data)
}

const addComponentToParent = (
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
  if (data && parentIndex) {
    data.parentIndex = parentIndex
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

export const pushCommandAndAddMissingMixins = <Data>(
  site: ISite,
  type: CommandType,
  data: Data,
  builtinMixinIds: string[] | undefined,
) => {
  const commands: ICommand[] = [{ type, data }]

  builtinMixinIds?.forEach((mixinId) => {
    const builtinStyle = builtinStyles[mixinId]
    const alreadyExists = !!resolveStyle(site.context, mixinId)
    if (!alreadyExists) {
      const addMixinData: IAddStyleMixinData = structuredClone(builtinStyle)
      commands.push({
        type: CommandType.AddStyleMixin,
        data: addMixinData,
      })
    }
  })

  pushCommand(site, CommandType.Group, { commands } as ICommandGroupData)
}
