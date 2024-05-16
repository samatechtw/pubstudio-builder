import {
  registerBuiltinBehavior,
  resolveComponent,
} from '@pubstudio/frontend/util-builtin'
import {
  clearErrorBehaviorId,
  contactFormBehaviorId,
  homeLinkBehaviorId,
  mailingListBehaviorId,
  noBehaviorId,
  setHiddenId,
  toggleHiddenId,
} from '@pubstudio/frontend/util-ids'
import { findComponent } from '@pubstudio/frontend/util-render'
import {
  ComponentArgPrimitive,
  Css,
  IBehavior,
  IBehaviorContext,
  IBehaviorCustomArgs,
  IBehaviorHelpers,
  IComponent,
  Tag,
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

export const clearFormErrorBehavior: IBehavior = {
  id: clearErrorBehaviorId,
  name: 'Clear Error',
  args: {
    errorId: {
      name: 'errorId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the error component',
    },
  },
  builtin: async (
    helpers: IBehaviorHelpers,
    behaviorContext: IBehaviorContext,
    args?: IBehaviorCustomArgs,
  ) => {
    const { site } = behaviorContext
    if (args?.errorId) {
      const errorCmp = helpers.getComponent(site, args.errorId as string)
      helpers.setContent(errorCmp, '')
      helpers.setCustomStyle(errorCmp, Css.Opacity, '0')
    }
  },
}
registerBuiltinBehavior(clearFormErrorBehavior)

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
    const { site, event, component } = behaviorContext
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
      const button = findComponent(component, (cmp) => cmp.tag === Tag.Button)
      try {
        helpers.setLoading(button, true)
        const row: Record<string, string> = {
          [resolvedArgs.apiEmailField]: email ?? '',
          [resolvedArgs.apiMessageField]: message ?? '',
        }
        if (args?.apiNameField && name) {
          row[args?.apiNameField as string] = name
        }
        await helpers.addRow(resolvedArgs.tableName, row)
        helpers.setCustomStyle(errorCmp, Css.Opacity, '1')
        helpers.setCustomStyle(errorCmp, Css.Color, '${color-success}')
        helpers.setContent(errorCmp, 'Contact request sent!')
      } catch (e) {
        helpers.setError(errorCmp, e, {
          CustomDataUniqueFail: 'Contact request already submitted',
        })
      }
      helpers.setLoading(button, false)
    }
  },
}
registerBuiltinBehavior(contactFormBehavior)

export const mailingListBehavior: IBehavior = {
  id: mailingListBehaviorId,
  name: 'Mailing List Submit',
  args: {
    tableName: {
      name: 'tableName',
      type: ComponentArgPrimitive.String,
      help: 'The name of the API table linked to the mailing list.',
    },
    emailId: {
      name: 'emailId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the email input component',
    },
    nameId: {
      name: 'nameId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the mailing list name input component (optional)',
    },
    errorId: {
      name: 'errorId',
      type: ComponentArgPrimitive.String,
      help: 'The ID of the error component',
    },
    apiEmailField: {
      name: 'apiEmailField',
      type: ComponentArgPrimitive.String,
      help: 'The column to store the email in the API table',
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
    const { site, event, component } = behaviorContext
    event?.preventDefault()
    const { error: argError, ...resolvedArgs } = helpers.requireArgs(args, [
      'tableName',
      'emailId',
      'errorId',
      'apiEmailField',
    ])
    const errorCmp = helpers.getComponent(site, resolvedArgs.errorId)
    if (argError) {
      console.warn(argError)
      helpers.setContent(errorCmp, 'Unknown form error')
    } else {
      let name: string | undefined
      const email = helpers.getValue(resolvedArgs.emailId)
      if (args?.nameId) {
        name = helpers.getValue(args.nameId as string)
      }
      const button = findComponent(component, (cmp) => cmp.tag === Tag.Button)
      try {
        helpers.setLoading(button, true)
        const row: Record<string, string> = {
          [resolvedArgs.apiEmailField]: email ?? '',
        }
        if (args?.apiNameField && name) {
          row[args?.apiNameField as string] = name
        }
        await helpers.addRow(resolvedArgs.tableName, row)
        helpers.setCustomStyle(errorCmp, Css.Opacity, '1')
        helpers.setCustomStyle(errorCmp, Css.Color, '${color-success}')
        helpers.setContent(errorCmp, 'Subscribed!')
      } catch (e) {
        helpers.setError(errorCmp, e, {
          CustomDataUniqueFail: "You're already subscribed!",
        })
      }
      helpers.setLoading(button, false)
    }
  },
}
registerBuiltinBehavior(mailingListBehavior)
