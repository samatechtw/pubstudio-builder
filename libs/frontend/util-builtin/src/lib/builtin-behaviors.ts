import {
  clearErrorBehaviorId,
  contactFormBehaviorId,
  homeLinkBehaviorId,
  mailingListBehaviorId,
  noBehaviorId,
  selectLanguageBehaviorId,
  setHiddenId,
  setupLanguageBehaviorId,
  toggleHiddenId,
  viewCounterBehaviorId,
} from '@pubstudio/frontend/util-ids'
import { ComponentArgPrimitive, IBehavior } from '@pubstudio/shared/type-site'

export const noBehavior: IBehavior = { id: noBehaviorId, name: 'None', code: '' }

export const selectLanguage: IBehavior = {
  id: selectLanguageBehaviorId,
  name: 'SelectLanguage',
  args: {
    language: {
      name: 'language',
      type: ComponentArgPrimitive.String,
      default: 'en',
      help: 'Language code',
    },
  },
  code: 'helpers.setLanguage(site, args.language)',
}

export const setupLanguage: IBehavior = {
  id: setupLanguageBehaviorId,
  name: 'SetupLanguage',
  args: {
    default: {
      name: 'default',
      type: ComponentArgPrimitive.String,
      default: 'en',
      help: 'Language code',
    },
  },
  code: 'helpers.setContent(component, site.context.activeI18n ?? args.default)',
}

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
  code: `let cmp = undefined
if (args?.id) {
  cmp = getComponent(site, args.id)
}
setState(cmp, 'hide', !getState(cmp, 'hide'))
`,
}

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
  code: `let cmp = undefined
if (args?.id) {
  cmp = getComponent(site, args.id)
}
setState(cmp, 'hide', !!args?.hide)
`,
}

export const viewCounterBehavior: IBehavior = {
  id: viewCounterBehaviorId,
  name: 'View Counter',
  code: `const getUsage = async () => {
  const usage = await helpers.getPublicUsage(site)
  helpers.setContent(component, usage.total_request_count.toString())
}
getUsage()
  `,
}

export const homeLinkBehavior: IBehavior = {
  id: homeLinkBehaviorId,
  name: 'Home Link',
  code: `const homeRoute = site.defaults.homePage
if (component.inputs?.href?.is !== homeRoute) {
  helpers.setInput(component, 'href', homeRoute)
}
`,
}

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
  code: `if (args?.errorId) {
  const errorCmp = getComponent(site, args.errorId)
  helpers.setContent(errorCmp, '')
  helpers.setCustomStyle(errorCmp, 'opacity', '0')
}
`,
}

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
  code: `event?.preventDefault()
const { error: argError, ...resolvedArgs } = helpers.requireArgs(args, [
  'tableName',
  'emailId',
  'messageId',
  'errorId',
  'apiEmailField',
  'apiMessageField',
])
const errorCmp = getComponent(site, resolvedArgs.errorId)
if (argError) {
  console.warn(argError)
  helpers.setContent(errorCmp, 'Unknown form error')
} else {
  let name
  const email = helpers.getValue(resolvedArgs.emailId)
  const message = helpers.getValue(resolvedArgs.messageId)
  if (args?.nameId) {
    name = helpers.getValue(args.nameId)
  }
  const button = helpers.findComponent(component, (cmp) => cmp.tag === 'button')
  try {
    helpers.setLoading(button, true)
    const row = {
      [resolvedArgs.apiEmailField]: email ?? '',
      [resolvedArgs.apiMessageField]: message ?? '',
    }
    if (args?.apiNameField && name) {
      row[args?.apiNameField] = name
    }
    helpers.addRow(resolvedArgs.tableName, row).then(() => {
      helpers.setCustomStyle(errorCmp, 'opacity', '1')
      helpers.setCustomStyle(errorCmp, 'color', '\${color-success}')
      helpers.setContent(errorCmp, 'Contact request sent!')
      helpers.setLoading(button, false)
    })
  } catch (e) {
    helpers.setError(errorCmp, e, {
      CustomDataUniqueFail: 'Contact request already submitted',
    })
    helpers.setLoading(button, false)
  }
}
`,
}

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
  code: `event?.preventDefault()
const { error: argError, ...resolvedArgs } = helpers.requireArgs(args, [
  'tableName',
  'emailId',
  'errorId',
  'apiEmailField',
])
const errorCmp = getComponent(site, resolvedArgs.errorId)
if (argError) {
  console.warn(argError)
  helpers.setContent(errorCmp, 'Unknown form error')
} else {
  let name
  const email = helpers.getValue(resolvedArgs.emailId)
  if (args?.nameId) {
    name = helpers.getValue(args.nameId)
  }
  const button = helpers.findComponent(component, (cmp) => cmp.tag === 'button')
  try {
    helpers.setLoading(button, true)
    const row = {
      [resolvedArgs.apiEmailField]: email ?? '',
    }
    if (args?.apiNameField && name) {
      row[args?.apiNameField] = name
    }
    helpers.addRow(resolvedArgs.tableName, row).then(() => {
      helpers.setCustomStyle(errorCmp, 'opacity', '1')
      helpers.setCustomStyle(errorCmp, 'color', '\${color-success}')
      helpers.setContent(errorCmp, 'Subscribed!')
      helpers.setLoading(button, false)
    })
  } catch (e) {
    helpers.setError(errorCmp, e, {
      CustomDataUniqueFail: "You're already subscribed!",
    })
    helpers.setLoading(button, false)
  }
}
`,
}

export const builtinBehaviors: Record<string, IBehavior> = {
  [noBehavior.id]: noBehavior,
  [selectLanguage.id]: selectLanguage,
  [setupLanguage.id]: setupLanguage,
  [toggleHidden.id]: toggleHidden,
  [setHidden.id]: setHidden,
  [viewCounterBehavior.id]: viewCounterBehavior,
  [homeLinkBehavior.id]: homeLinkBehavior,
  [clearFormErrorBehavior.id]: clearFormErrorBehavior,
  [contactFormBehavior.id]: contactFormBehavior,
  [mailingListBehavior.id]: mailingListBehavior,
}
