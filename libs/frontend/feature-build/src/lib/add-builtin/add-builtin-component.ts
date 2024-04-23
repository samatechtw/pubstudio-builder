import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { getActivePage } from '@pubstudio/frontend/feature-site-store'
import {
  builtinStyles,
  resolveComponent,
  resolveStyle,
} from '@pubstudio/frontend/util-builtin'
import { makeAddBuiltinComponentData } from '@pubstudio/frontend/util-command-data'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentData,
  IAddStyleMixinData,
  ICommandGroupData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, ISite, ISiteContext } from '@pubstudio/shared/type-site'

// Get builtin mixins from a component & children that have not
// been added to the site
const getMissingMixins = (
  context: ISiteContext,
  componentId: string | undefined,
): string[] => {
  const builtinComponent = resolveComponent(context, componentId)
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

export const addBuiltinComponentData = (site: ISite, data: IAddComponentData) => {
  const mixins = getMissingMixins(site.context, data.sourceId)
  pushCommandAndAddMissingMixins(site, CommandType.AddComponent, data, mixins)
}

export interface IAddBuiltinComponentOptions {
  id: string
  parentId?: string
  parentIndex?: number
}

export const addBuiltinComponent = (
  site: ISite,
  options: IAddBuiltinComponentOptions,
): string | undefined => {
  const activePage = getActivePage(site)
  if (!activePage) {
    return
  }
  const { id, parentId, parentIndex } = options

  let parent: IComponent | undefined
  if (parentId) {
    parent = resolveComponent(site.context, parentId)
  }
  parent = parent ?? site.editor?.selectedComponent ?? activePage.root

  const data = makeAddBuiltinComponentData(
    site,
    id,
    parent,
    site.editor?.selectedComponent?.id,
  )
  if (!data) {
    return
  }
  if (parentIndex) {
    data.parentIndex = parentIndex
  }
  addBuiltinComponentData(site, data)

  return data.id
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
