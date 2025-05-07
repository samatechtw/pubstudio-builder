import { useBuild } from '@pubstudio/frontend/feature-build'
import { i18nVarRegex } from '@pubstudio/frontend/feature-render'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { iterateComponent } from '@pubstudio/frontend/util-render'
import {
  resolveBehavior,
  resolveStyle,
  themeVariableSyntaxRegex,
} from '@pubstudio/frontend/util-resolve'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { addHUD } from '@pubstudio/frontend/util-ui-alert'
import {
  IBehavior,
  IBreakpointStyles,
  IComponent,
  ICopiedComponent,
  ISerializedComponent,
  IStyle,
  ITheme,
  ITranslations,
} from '@pubstudio/shared/type-site'
import { Ref, ref } from 'vue'
import { deduplicateExternalComponent } from './deduplicate-external-component'
import { parseNamespace } from './parse-namespace'
import { replacePastedComponentNamespace } from './replace-namespace'

// Export functions for testing
export interface IUseCopyPaste {
  showReplaceRootModalData: Ref<ClipboardData | undefined>
  pressCopy(evt: KeyboardEvent): void
  pressPaste(evt: KeyboardEvent): Promise<void>
  pasteStyle(copiedComponent: ISerializedComponent): void
  pasteComponent(copiedComponent: ISerializedComponent): void
  confirmPaste(replaceRoot: boolean): Promise<void>
}

type ClipboardData = {
  text: string | undefined
  copiedComponent: ICopiedComponent | undefined
  isLocal: boolean
}

function componentI18n(component: IComponent): string[] {
  const { content } = component
  if (!content) {
    return []
  }
  const matches = [...content.matchAll(i18nVarRegex)].map((match) => match[1])
  return matches
}

function getThemeVars(cssVal: string): string[] {
  const matches = [...cssVal.matchAll(themeVariableSyntaxRegex)].map((match) => match[1])
  return matches
}

// Get all theme variables from breakpoint styles, and add them to a target them
function getBreakpointStyleThemeVars(
  sourceTheme: ITheme,
  targetTheme: ITheme,
  bpStyles: IBreakpointStyles,
) {
  for (const bpStyle of Object.values(bpStyles)) {
    for (const rawStyle of Object.values(bpStyle)) {
      for (const cssVal of Object.values(rawStyle)) {
        const vars = getThemeVars(cssVal)
        for (const v of vars) {
          const val = sourceTheme.variables[v]
          if (val !== undefined) {
            targetTheme.variables[v] = val
          }
        }
      }
    }
  }
}

const showReplaceRootModalData = ref<ClipboardData | undefined>()

export const useCopyPaste = (): IUseCopyPaste => {
  const {
    site,
    editor,
    editSelectedComponent,
    mergeComponentStyle,
    pasteComponent: executePasteComponent,
    pasteExternalComponent,
    replacePageRoot,
  } = useBuild()
  const { apiSiteId } = useSiteSource()

  const pressCopy = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    const component = editor.value?.selectedComponent
    if (site.value.editor && component && (evt.ctrlKey || evt.metaKey)) {
      const context = site.value.context
      const serialized = serializeComponent(component)
      const behaviors: IBehavior[] = []
      const styles: IStyle[] = []
      const theme: ITheme = { variables: {}, fonts: {} }
      // Lazy init since translations may be uncommon
      let siteTranslations: [string, ITranslations][] | undefined
      const translations: Record<string, ITranslations> = {}
      iterateComponent(component, (cmp) => {
        const cmpBehaviors = Object.values(cmp.events ?? {})
          // Behavior IDs from component events
          .map((ev) => ev.behaviors.map((b) => resolveBehavior(context, b.behaviorId)))
          .flat()
          .filter((b) => !!b)
        behaviors.push(...cmpBehaviors)
        // Styles from component mixins
        const cmpStyles =
          cmp.style.mixins?.map((mId) => resolveStyle(context, mId)).filter((m) => !!m) ??
          []
        // Translations from content
        const cmpI18n = componentI18n(cmp)
        for (const i18nKey of cmpI18n) {
          if (!siteTranslations) {
            siteTranslations = Object.entries(context.i18n)
          }
          // Iterate languages, store value if i18nKey exists in language
          for (const [lang, siteI18n] of siteTranslations) {
            const siteI18nVal = siteI18n[i18nKey]
            if (!siteI18nVal) {
              continue
            }
            if (!translations[lang]) {
              translations[lang] = { [i18nKey]: siteI18nVal }
            } else {
              translations[lang][i18nKey] = siteI18nVal
            }
          }
        }
        getBreakpointStyleThemeVars(context.theme, theme, cmp.style.custom)
        styles.push(...cmpStyles)
      })
      // Get theme variables from mixin styles
      for (const style of styles) {
        getBreakpointStyleThemeVars(context.theme, theme, style.breakpoints)
      }
      const copyData: ICopiedComponent = {
        siteId: apiSiteId.value ?? 'unknown',
        component: serialized,
        breakpoints: context.breakpoints,
        translations,
        behaviors,
        styles,
        theme,
      }
      addHUD({ text: 'Copied' })

      // Firefox doesn't support clipboard.write ^_^
      if (typeof ClipboardItem && navigator.clipboard.write) {
        navigator.clipboard.write([
          new ClipboardItem({
            'web text/pubstudio': new Blob([JSON.stringify(copyData)], {
              type: 'web text/pubstudio',
            }),
            'text/plain': new Blob([serialized.content ?? ''], { type: 'text/plain' }),
          }),
        ])
      }
    }
  }

  const pasteStyle = (component: ISerializedComponent): void => {
    mergeComponentStyle(component)
    addHUD({ text: 'Style Pasted' })
  }

  const getClipboardData = async (): Promise<ClipboardData | undefined> => {
    const { selectedComponent } = site.value.editor ?? {}
    if (!selectedComponent) return undefined
    try {
      let text: string | undefined
      let copiedComponent: ICopiedComponent | undefined
      let isLocal = true
      // Iterate over all clipboard items.
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes('text/html')) {
          const blob = await clipboardItem.getType('text/html')
          text = await blob.text()
        } else if (clipboardItem.types.includes('text/plain')) {
          const blob = await clipboardItem.getType('text/plain')
          text = await blob.text()
        }
        if (clipboardItem.types.includes('web text/pubstudio')) {
          const blob = await clipboardItem.getType('web text/pubstudio')
          copiedComponent = JSON.parse(await blob.text()) as ICopiedComponent
          isLocal = copiedComponent.siteId === apiSiteId.value
          if (!isLocal) {
            const oldNamespace = parseNamespace(copiedComponent.component.id)
            if (!oldNamespace) {
              return undefined
            }
            copiedComponent = deduplicateExternalComponent(site.value, copiedComponent)
            replacePastedComponentNamespace(
              copiedComponent.component,
              oldNamespace,
              site.value.context.namespace,
            )
          }
        }
        return { text, copiedComponent, isLocal }
      }
    } catch (err) {
      console.error('Failed to paste from clipboard', err)
    }
    return undefined
  }

  const pasteComponent = (component: ISerializedComponent): void => {
    const sel = site.value.editor?.selectedComponent
    if (!sel) return

    // If the copied component is still selected, paste to its parent
    const parent = component.id === sel.id ? sel.parent : sel
    if (parent) {
      executePasteComponent(component.id, parent)
    }
    addHUD({ text: 'Component Pasted' })
  }

  const pressPaste = async (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    const pasteData = await getClipboardData()
    const selectedComponent = site.value.editor?.selectedComponent
    if (!pasteData || !selectedComponent) {
      return
    } else if (evt.shiftKey) {
      const component = pasteData?.copiedComponent?.component
      // Make sure we don't paste style to the same component
      if (component && selectedComponent.id !== component.id) {
        pasteStyle(component)
      }
    } else {
      pasteClipboardComponent(pasteData, selectedComponent, true)
    }
  }

  const pasteClipboardComponent = (
    data: ClipboardData,
    selectedComponent: IComponent,
    warnRoot: boolean,
  ) => {
    const { isLocal, copiedComponent, text } = data
    if (copiedComponent) {
      const component = copiedComponent.component
      const isRoot =
        !!selectedComponent &&
        !selectedComponent.parent &&
        selectedComponent.id !== copiedComponent.component.id
      if (warnRoot && isRoot && isLocal && component.children) {
        // Show a warning before replacing the root component
        // Components from an external site currently cannot replace root components
        showReplaceRootModalData.value = data
        return
      }
      if (isLocal) {
        if (!component.parentId) {
          // Root component should not be pasted through paste hotkey.
          addHUD({
            text: 'Root component can only be used to replace another root component',
            duration: 2000,
          })
        } else {
          pasteComponent(component)
        }
      } else if (copiedComponent) {
        pasteExternalComponent(copiedComponent, selectedComponent)
        addHUD({ text: 'Component Pasted' })
      }
    } else if (text) {
      editSelectedComponent({ content: text })
    }
  }

  const replaceRootWithCopiedComponent = async (pasteData: ClipboardData) => {
    if (editor.value?.active && pasteData?.copiedComponent && pasteData?.isLocal) {
      const component = pasteData.copiedComponent.component
      replacePageRoot(component.id, editor.value.active)
      addHUD({ text: 'Replaced' })
    }
  }

  // Replace root, or paste as root child, depending on user selection
  const confirmPaste = async (replaceRoot: boolean) => {
    const pasteData = showReplaceRootModalData.value
    showReplaceRootModalData.value = undefined
    if (!editor.value?.active || !pasteData) {
      return
    }
    if (replaceRoot) {
      replaceRootWithCopiedComponent(pasteData)
    } else {
      const root = site.value.pages[editor.value.active]?.root
      if (root) {
        pasteClipboardComponent(pasteData, root, false)
      }
    }
  }

  return {
    showReplaceRootModalData,
    pressCopy,
    pressPaste,
    pasteStyle,
    pasteComponent,
    confirmPaste,
  }
}
