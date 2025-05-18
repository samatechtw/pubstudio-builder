import {
  clearErrorBehaviorId,
  contactFormBehaviorId,
  downloadImageBehaviorId,
  hideLightboxBehaviorId,
  homeLinkBehaviorId,
  lightboxImageLoadBehaviorId,
  mailingListBehaviorId,
  noBehaviorId,
  selectLanguageBehaviorId,
  setHiddenId,
  setupLanguageBehaviorId,
  showLightboxBehaviorId,
  stopClickBehaviorId,
  toggleHiddenId,
  updateNavIndexId,
  viewCounterBehaviorId,
} from '@pubstudio/frontend/util-ids'
import { ComponentArgPrimitive, IBehavior } from '@pubstudio/shared/type-site'

export const noBehavior: IBehavior = { id: noBehaviorId, name: 'None', code: '' }

const stopClick: IBehavior = {
  id: stopClickBehaviorId,
  name: 'Stop Click',
  code: `event?.preventDefault()
event?.stopPropagation()`,
}

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
      help: 'The ID of the component which will be toggled',
    },
  },
  code: `const cmp = getComponent(site, args.id)
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
      help: 'The ID of the component which will be hidden',
    },
    hide: {
      name: 'hide',
      type: ComponentArgPrimitive.Boolean,
      help: 'Set true to hide, false to show',
    },
  },
  code: `const cmp = getComponent(site, args.id)
setState(cmp, 'hide', !!args?.hide)
`,
}

export const viewCounterBehavior: IBehavior = {
  id: viewCounterBehaviorId,
  name: 'View Counter',
  code: `const getUsage = async () => {
  const usage = await helpers.getPublicUsage(site)
  helpers.setContent(component, usage.total_site_view_count.toString())
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
      help: 'The name of the API table linked to the contact form',
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
const submit = async () => {
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
      await helpers.addRow(resolvedArgs.tableName, row)
      helpers.setCustomStyle(errorCmp, 'opacity', '1')
      helpers.setCustomStyle(errorCmp, 'color', '\${color-success}')
      helpers.setContent(errorCmp, 'Contact request sent!')
      helpers.setLoading(button, false)
      helpers.setState(button, 'hide', true)
    } catch (e) {
      helpers.setError(errorCmp, e, {
        CustomDataUniqueFail: 'Contact request already submitted',
      })
      helpers.setLoading(button, false)
    }
  }
}
submit()
`,
}

export const mailingListBehavior: IBehavior = {
  id: mailingListBehaviorId,
  name: 'Mailing List Submit',
  args: {
    tableName: {
      name: 'tableName',
      type: ComponentArgPrimitive.String,
      help: 'The name of the API table linked to the mailing list',
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

const showLightboxBehavior: IBehavior = {
  id: showLightboxBehaviorId,
  name: 'Show Lightbox',
  args: {
    imageIndex: {
      name: 'imageIndex',
      type: ComponentArgPrimitive.Boolean,
      help: 'Index of image to show',
    },
    lightboxId: {
      name: 'lightboxId',
      type: ComponentArgPrimitive.String,
      help: 'Lightbox component ID',
    },
    loaderId: {
      name: 'loaderId',
      type: ComponentArgPrimitive.String,
      help: 'Image loader component ID',
    },
  },
  code: `event?.preventDefault()
event?.stopPropagation()
const imageIndex = args.imageIndex

const lightbox = helpers.getComponent(site, args.lightboxId)
setState(lightbox, 'hide', false)
const setLightboxIndex = (index) => {
  const data = window[args.lightboxId]
  if(!data || imageIndex === undefined) {
    return
  }
  const idx = (index + data.images.length) % data.images.length
  const lightbox = helpers.getComponent(site, args.lightboxId)
  const loader = helpers.getComponent(site, args.loaderId)
  const src = data.images[idx]
  const imgWrap = lightbox?.children?.[0]?.children?.[1]
  const img = imgWrap?.children?.[1]

  const imgEl = document.getElementById(img?.id)
  if(imgEl) {
    // imgEl.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    const width = imgEl.getBoundingClientRect().width
    const minWidth = width ? (width + 'px') : '300px'
    helpers.setCustomStyle(img, 'min-width', minWidth)
  }
    /*
  const onImageLoad = () => {
    setState(loader, 'hide', true)
    imgEl?.removeEventListener('load', onImageLoad);
    imgEl?.removeEventListener('error', onImageLoad);
  }
  imgEl?.addEventListener('load', onImageLoad);
  imgEl?.addEventListener('error', onImageLoad);
  */
  setState(loader, 'hide', false)

  helpers.setInput(img, 'src', src)
  window[args.lightboxId].index = idx
}
const images = component.parent?.children ?? []
window[args.lightboxId] = {
  index: imageIndex,
  images: images.map(m => m?.children?.[0]?.inputs?.src?.is),
  setIndex: setLightboxIndex
}
setLightboxIndex(imageIndex)
`,
}

const hideLightboxBehavior: IBehavior = {
  id: hideLightboxBehaviorId,
  name: 'Hide Lightbox',
  args: {
    lightboxId: {
      name: 'lightboxId',
      type: ComponentArgPrimitive.String,
      help: 'Lightbox component ID',
    },
    onKey: {
      name: 'onKey',
      type: ComponentArgPrimitive.String,
      help: 'Key to trigger hide',
    },
  },
  code: `const key = args.onKey
if(key && key !== event?.key) {
  return
}
event?.preventDefault()
event?.stopPropagation()
const lightbox = helpers.getComponent(site, args.lightboxId)
setState(lightbox, 'hide', true)
window[args.lightboxId] = undefined
`,
}

const lightboxImageLoadBehavior: IBehavior = {
  id: lightboxImageLoadBehaviorId,
  name: 'Lightbox Image Load',
  args: {
    loaderId: {
      name: 'loaderId',
      type: ComponentArgPrimitive.String,
      help: 'Image loader component ID',
    },
  },
  code: `const loader = getComponent(site, args.loaderId)
setState(loader, 'hide', true)
const imgEl = document.getElementById(component.id)
if(imgEl) {
  const width = imgEl.getBoundingClientRect().width
  const minWidth = width ? (width + 'px') : '300px'
  helpers.setCustomStyle(component, 'min-width', minWidth)
}
`,
}

const updateNavIndex: IBehavior = {
  id: updateNavIndexId,
  name: 'Set Nav Index',
  args: {
    navDataId: {
      name: 'navDataId',
      type: ComponentArgPrimitive.String,
      help: 'ID of nav data stored in window',
    },
    onKey: {
      name: 'onKey',
      type: ComponentArgPrimitive.String,
      help: 'Key to trigger update',
    },
    increment: {
      name: 'increment',
      type: ComponentArgPrimitive.Number,
      help: 'Amount to increment nav index',
    },
  },
  code: `const data = window[args.navDataId]
const increment = args.increment ?? 0
const key = args.onKey
if(!data || (key && key !== event?.key)) {
  return
}
event?.preventDefault()
event?.stopPropagation()
data.setIndex(data.index + increment)
`,
}

const downloadImageBehavior: IBehavior = {
  id: downloadImageBehaviorId,
  name: 'Download Image',
  args: {
    imageId: {
      name: 'imageId',
      type: ComponentArgPrimitive.String,
      help: 'Lightbox image component ID',
    },
  },
  code: `event?.preventDefault()
event?.stopPropagation()
const image = document.getElementById(args.imageId)
const download = (imgEl) => {
  const canvas = document.createElement('canvas');
  canvas.width  = imgEl.naturalWidth;
  canvas.height = imgEl.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0);

  canvas.toBlob(blob => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = imgEl.src.split('/').pop().split('?')[0];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 'image/png');
}
download(image)
`,
}

export const builtinBehaviors: Record<string, IBehavior> = {
  [noBehavior.id]: noBehavior,
  [stopClick.id]: stopClick,
  [selectLanguage.id]: selectLanguage,
  [setupLanguage.id]: setupLanguage,
  [toggleHidden.id]: toggleHidden,
  [setHidden.id]: setHidden,
  [viewCounterBehavior.id]: viewCounterBehavior,
  [homeLinkBehavior.id]: homeLinkBehavior,
  [clearFormErrorBehavior.id]: clearFormErrorBehavior,
  [contactFormBehavior.id]: contactFormBehavior,
  [mailingListBehavior.id]: mailingListBehavior,
  [showLightboxBehavior.id]: showLightboxBehavior,
  [hideLightboxBehavior.id]: hideLightboxBehavior,
  [lightboxImageLoadBehavior.id]: lightboxImageLoadBehavior,
  [downloadImageBehavior.id]: downloadImageBehavior,
  [updateNavIndex.id]: updateNavIndex,
}
