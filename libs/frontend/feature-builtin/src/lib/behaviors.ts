import { mergeLastCommand } from '@pubstudio/frontend/data-access-command'
import {
  builtinStyles,
  defaultNavMenuItemInputs,
  registerBuiltinBehavior,
  resolveComponent,
  resolveStyle,
} from '@pubstudio/frontend/util-builtin'
import {
  makeAddBuiltinComponentData,
  makeEditComponentData,
  makeRemoveComponentData,
  makeSetInputData,
} from '@pubstudio/frontend/util-command-data'
import {
  contactFormBehaviorId,
  homeLinkBehaviorId,
  navItemBehaviorId,
  navMenuBehaviorId,
  navMenuItemId,
  navMenuItemStyleId,
  noBehaviorId,
  setHiddenId,
  toggleHiddenId,
} from '@pubstudio/frontend/util-ids'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddStyleMixinData } from '@pubstudio/shared/type-command-data'
import {
  ComponentArgPrimitive,
  IBehavior,
  IBehaviorContext,
  IBehaviorCustomArgs,
  IBehaviorHelpers,
  IComponent,
  ISite,
} from '@pubstudio/shared/type-site'

export const noBehavior: IBehavior = {
  id: noBehaviorId,
  name: 'None',
  builtin: (_helpers: IBehaviorHelpers, _behaviorContext: IBehaviorContext) => {
    // No operation
  },
}
registerBuiltinBehavior(noBehavior)

export const toggleHidden: IBehavior = {
  id: toggleHiddenId,
  name: 'Toggle Hidden',
  args: {
    id: {
      name: 'id',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the component which will be toggled.',
    },
  },
  builtin: (
    helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    let cmp: IComponent | undefined = undefined
    if (args?.id) {
      cmp = resolveComponent(site.context, args.id as string)
    }
    helpers.setState(cmp, 'hide', !cmp?.state?.hide)
  },
}
registerBuiltinBehavior(toggleHidden)

export const setHidden: IBehavior = {
  id: setHiddenId,
  name: 'Set Hidden',
  args: {
    id: {
      name: 'id',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the component which will be hidden.',
    },
    hide: {
      name: 'hide',
      type: ComponentArgPrimitive.Boolean,
      help: 'Set true to hide, false to show',
    },
  },
  builtin: (
    helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    let cmp: IComponent | undefined = undefined
    if (args?.id) {
      cmp = resolveComponent(site.context, args.id as string)
    }
    helpers.setState(cmp, 'hide', !!args?.hide)
  },
}
registerBuiltinBehavior(setHidden)

export const homeLinkBehavior: IBehavior = {
  id: homeLinkBehaviorId,
  name: 'Home Link',
  builtin: (
    helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site, component } = behaviorContext
    const homeRoute = site.defaults.homePage
    if (component.inputs?.href?.is !== homeRoute) {
      helpers.setInputIs(component, 'href', homeRoute)
    }
  },
}
registerBuiltinBehavior(homeLinkBehavior)

const syncNavMenu = (site: ISite, cmp: IComponent) => {
  const { pages } = site
  const syncedChildren = (cmp.children ?? []).filter((c) => !!c.inputs?.sync?.is)
  const childCount = syncedChildren.length ?? 0
  const routes = Object.keys(pages)

  const commands: ICommand[] = []
  if (routes.length === childCount) {
    // Page edited
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
  } else if (routes.length > childCount) {
    // Page added
    const childHrefs = syncedChildren.map((c) => c.inputs?.href?.is)
    for (const route of routes) {
      if (!childHrefs.includes(route)) {
        const addData = makeAddBuiltinComponentData(site, navMenuItemId, cmp, undefined)
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

export const navMenuBehavior: IBehavior = {
  id: navMenuBehaviorId,
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
    helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    _args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    const cmp = behaviorContext.component
    syncNavMenu(site, cmp)
  },
}
registerBuiltinBehavior(navMenuBehavior)

export const contactFormBehavior: IBehavior = {
  id: contactFormBehaviorId,
  name: 'Contact Form Submit',
  args: {
    tableName: {
      name: 'tableName',
      type: ComponentArgPrimitive.String,
      help: 'The name of the API table linked to the contact form.',
    },
    emailId: {
      name: 'emailId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the email input component',
    },
    messageId: {
      name: 'messageId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the message input component',
    },
    nameId: {
      name: 'nameId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the contact name input component (optional)',
    },
    errorId: {
      name: 'errorId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the error component',
    },
    apiEmailField: {
      name: 'apiEmailField',
      type: ComponentArgPrimitive.String,
      help: 'The column to store the contact email in the API table',
    },
    apiMessageField: {
      name: 'apiMessageField',
      type: ComponentArgPrimitive.String,
      help: 'The column to store the message in the API table',
    },
    apiNameField: {
      name: 'apiNameField',
      type: ComponentArgPrimitive.String,
      help: 'The column to store the contact name in the API table (optional)',
    },
  },
  builtin: async (
    helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    args?: IBehaviorCustomArgs,
  ) => {
    const { site, event } = behaviorContext
    event?.preventDefault()
    const { error: argError, ...resolvedArgs } = helpers.requireArgs(args, [
      'tableName',
      'emailId',
      'messageId',
      'errorId',
      'apiEmailField',
      'apiMessageField',
    ])
    const errorCmp = helpers.getComponent(site, resolvedArgs.errorId)
    if (argError) {
      console.warn(argError)
      helpers.setContent(errorCmp, 'Unknown form error')
    } else {
      let name: string | undefined
      const email = helpers.getValue(resolvedArgs.emailId)
      const message = helpers.getValue(resolvedArgs.messageId)
      if (args?.nameId) {
        name = helpers.getValue(args.nameId as string)
      }
      try {
        const row: Record<string, string> = {
          [resolvedArgs.apiEmailField]: email ?? '',
          [resolvedArgs.apiMessageField]: message ?? '',
        }
        if (args?.apiNameField && name) {
          row[args?.apiNameField as string] = name
        }
        await helpers.addRow(resolvedArgs.tableName, row)
      } catch (e) {
        console.error(e)
        helpers.setContent(errorCmp, 'Failed to save, please try again later')
      }
    }
  },
}
registerBuiltinBehavior(contactFormBehavior)
