import { createSite } from '@pubstudio/frontend/data-access-command'
import { addBuiltinComponent, useBuild } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { containerVertical, h1 } from '@pubstudio/frontend/util-builtin'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { storeSite } from '@pubstudio/frontend/util-site-store'
import {
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/feature-site-store-init'
import { Css, CssPseudoClass, IEditorContext, ISite } from '@pubstudio/shared/type-site'
import { ref } from 'vue'

export const makeMockStore = (): ISiteStore => {
  const siteId = ref('')
  const saveError = ref()
  const saveState = ref(SiteSaveState.Saved)

  const initialize = async () => undefined
  const save = async (_site: ISite) => {}
  const saveEditor = async (_editor: IEditorContext) => {}
  const restore = async (): Promise<ISiteRestore> => {
    return {} as ISiteRestore
  }
  const setUpdateKey = (_key: string | undefined) => {}
  return {
    siteId,
    saveState,
    saveError,
    initialize,
    save,
    saveEditor,
    restore,
    setUpdateKey,
  }
}

const { initializeSite, site } = useSiteSource()
await initializeSite({ store: makeMockStore(), siteId: undefined })
site.value = createSite('__namespace__')

const { setCustomStyle, getSelectedComponent, editSelectedComponent } = useBuild()
const selectedComponent = getSelectedComponent()

addBuiltinComponent(site.value, { id: containerVertical.id })
setCustomStyle(
  selectedComponent,
  {
    pseudoClass: CssPseudoClass.Default,
    property: Css.Width,
    value: h1.style.custom[DEFAULT_BREAKPOINT_ID]?.[CssPseudoClass.Default]?.[
      Css.Width
    ] as string,
  },
  {
    pseudoClass: CssPseudoClass.Default,
    property: Css.Width,
    value: '100%',
  },
)
addBuiltinComponent(site.value, { id: h1.id })
editSelectedComponent({ content: 'My Site' })
setCustomStyle(selectedComponent, undefined, {
  pseudoClass: CssPseudoClass.Default,
  property: Css.AlignContent,
  value: 'center',
})
setCustomStyle(selectedComponent, undefined, {
  pseudoClass: CssPseudoClass.Default,
  property: Css.TextAlign,
  value: 'center',
})
setCustomStyle(selectedComponent, undefined, {
  pseudoClass: CssPseudoClass.Default,
  property: Css.Margin,
  value: '40px 0 40px 0',
})

const printSiteField = (key: string, field: string | null | undefined) => {
  console.log(`pub const ${key}: &str = r##"${field ?? ''}"##;`)
}

const stored = storeSite(site.value)
printSiteField('SITE_SEED_CONTEXT', stored.context)
printSiteField('SITE_SEED_EDITOR', stored.editor)
printSiteField('SITE_SEED_HISTORY', stored.history)
printSiteField('SITE_SEED_PAGES', stored.pages)
