import {
  appendLastCommand,
  mergeLastCommand,
  toggleComponentTreeHidden,
} from '@pubstudio/frontend/data-access-command'
import { builtinStyles, defaultNavMenuItemInputs } from '@pubstudio/frontend/util-builtin'
import {
  makeAddBuiltinComponentData,
  makeEditComponentData,
  makeRemoveComponentData,
  makeSetInputData,
} from '@pubstudio/frontend/util-command-data'
import {
  navItemBehaviorId,
  navMenuAddBehaviorId,
  navMenuChangeBehaviorId,
  navMenuItemId,
  navMenuItemStyleId,
  navMenuRemoveBehaviorId,
  setupLoaderBehaviorId,
} from '@pubstudio/frontend/util-ids'
import { registerBuiltinBehavior, resolveStyle } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddStyleMixinData,
  ISetGlobalStyleData,
} from '@pubstudio/shared/type-command-data'
import {
  ComponentArgPrimitive,
  IBehavior,
  IBehaviorContext,
  IBehaviorCustomArgs,
  IBehaviorHelpers,
  IComponent,
  ISite,
} from '@pubstudio/shared/type-site'

const navMenuAddPage = (site: ISite, cmp: IComponent) => {
  const { pages } = site
  const commands: ICommand[] = []
  const syncedChildren = (cmp.children ?? []).filter((c) => !!c.inputs?.sync?.is)
  const routes = Object.keys(pages)

  const childHrefs = syncedChildren.map((c) => c.inputs?.href?.is)
  for (const route of routes) {
    if (!childHrefs.includes(route)) {
      const addData = makeAddBuiltinComponentData(navMenuItemId, cmp, undefined)
      if (addData) {
        addData.inputs = defaultNavMenuItemInputs(route, pages[route].name, true)
        addData.content = pages[route].name
        commands.push({ type: CommandType.AddComponent, data: addData })
        const builtinStyle = builtinStyles[navMenuItemStyleId]
        const alreadyExists = resolveStyle(site.context, navMenuItemStyleId)
        if (builtinStyle && !alreadyExists) {
          const addMixinData: IAddStyleMixinData = structuredClone(builtinStyle)
          commands.push({ type: CommandType.AddStyleMixin, data: addMixinData })
        }
      }
    }
  }
  mergeLastCommand(site, commands)
}

const navMenuRemovePage = (site: ISite, cmp: IComponent) => {
  const { pages } = site
  const commands: ICommand[] = []
  const syncedChildren = (cmp.children ?? []).filter((c) => !!c.inputs?.sync?.is)

  for (const child of syncedChildren) {
    const sync = child.inputs?.sync?.is
    const route = child.inputs?.href?.is as string
    if (sync && route && !pages[route]) {
      const removeData = makeRemoveComponentData(site, child)
      commands.push({ type: CommandType.RemoveComponent, data: removeData })
    }
  }
  mergeLastCommand(site, commands)
}

const navMenuChangePage = (site: ISite, cmp: IComponent) => {
  const { pages } = site
  const commands: ICommand[] = []
  const syncedChildren = (cmp.children ?? []).filter((c) => !!c.inputs?.sync?.is)
  const routes = Object.keys(pages)

  for (const child of syncedChildren) {
    const route = child.inputs?.href?.is as string
    const content = child.inputs?.name?.is as string
    let page = pages[route]
    // Page route changed
    if (!page) {
      const childRoutes = syncedChildren.map((c) => c.inputs?.href?.is)
      const newRoute = routes.find((r) => !childRoutes.includes(r))
      if (newRoute) {
        page = pages[newRoute]
        const hrefData = makeSetInputData(child, 'href', {
          is: newRoute,
        })
        commands.push({ type: CommandType.SetComponentInput, data: hrefData })
      }
    }
    // Page name changed
    console.log('SYNC', child)
    if (page && page.name !== content) {
      const setInputData = makeSetInputData(child, 'name', {
        is: page.name,
      })
      const editComponentData = makeEditComponentData(child, {
        content: page.name,
      })
      commands.push({ type: CommandType.SetComponentInput, data: setInputData })
      commands.push({ type: CommandType.EditComponent, data: editComponentData })
    }
  }
  mergeLastCommand(site, commands)
}

const syncNavMenu = (site: ISite, cmp: IComponent) => {
  const { pages } = site
  const syncedChildren = (cmp.children ?? []).filter((c) => !!c.inputs?.sync?.is)
  const childCount = syncedChildren.length ?? 0
  const routes = Object.keys(pages)

  const commands: ICommand[] = []
  if (routes.length === childCount) {
    // Page edited
  } else if (routes.length > childCount) {
    // Page added
  } else {
    // Page removed
    for (const child of syncedChildren) {
      const sync = child.inputs?.sync?.is
      const route = child.inputs?.href?.is as string
      if (sync && route && !pages[route]) {
        const removeData = makeRemoveComponentData(site, child)
        commands.push({ type: CommandType.RemoveComponent, data: removeData })
      }
    }
  }
  mergeLastCommand(site, commands)
}

export const navItemBehavior: IBehavior = {
  id: navItemBehaviorId,
  name: 'Sync Nav Menu Item',
  builtin: (
    _helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    const cmp = behaviorContext.component
    if (cmp.parent) {
      syncNavMenu(site, cmp.parent)
    }
  },
}
registerBuiltinBehavior(navItemBehavior)

const navMenuAddPageBehavior: IBehavior = {
  id: navMenuAddBehaviorId,
  name: 'Sync Nav Menu',
  args: {
    IncludeHome: {
      name: 'IncludeHome',
      type: ComponentArgPrimitive.Boolean,
      default: true,
      help: '',
    },
  },
  builtin: (
    _helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    const cmp = behaviorContext.component
    navMenuAddPage(site, cmp)
  },
}
registerBuiltinBehavior(navMenuAddPageBehavior)

const navMenuRemovePageBehavior: IBehavior = {
  id: navMenuRemoveBehaviorId,
  name: 'Sync Nav Menu',
  args: {
    IncludeHome: {
      name: 'IncludeHome',
      type: ComponentArgPrimitive.Boolean,
      default: true,
      help: '',
    },
  },
  builtin: (
    _helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    const cmp = behaviorContext.component
    navMenuRemovePage(site, cmp)
  },
}
registerBuiltinBehavior(navMenuRemovePageBehavior)

const navMenuChangePageBehavior: IBehavior = {
  id: navMenuChangeBehaviorId,
  name: 'Sync Nav Menu',
  args: {
    IncludeHome: {
      name: 'IncludeHome',
      type: ComponentArgPrimitive.Boolean,
      default: true,
      help: '',
    },
  },
  builtin: (
    _helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    const cmp = behaviorContext.component
    navMenuChangePage(site, cmp)
  },
}
registerBuiltinBehavior(navMenuChangePageBehavior)

export const setupLoaderBehavior: IBehavior = {
  id: setupLoaderBehaviorId,
  name: 'Setup Loader',
  builtin: (
    _helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    const button = behaviorContext.component
    let hasScaleStyle = false
    for (const [name, data] of Object.entries(site.context.globalStyles)) {
      if (name === 'BuiltinScale' || data.style.includes('@keyframes scale {')) {
        hasScaleStyle = true
      }
    }
    if (!hasScaleStyle) {
      const addStyleData: ISetGlobalStyleData = {
        name: 'BuiltinScale',
        newStyle: {
          style: `@keyframes scale {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }`,
        },
      }
      const command = {
        type: CommandType.SetGlobalStyle,
        data: addStyleData,
      }
      appendLastCommand(site, command)
    }
    // Hide loader in the UI
    const loaderId = button?.children?.[1]?.id
    if (loaderId) {
      toggleComponentTreeHidden(site, loaderId, true)
    }
  },
}
registerBuiltinBehavior(setupLoaderBehavior)
