import { makeAddBuiltinStyleMixin } from '@pubstudio/frontend/data-access-command'
import { i18nVarRegex } from '@pubstudio/frontend/feature-render'
import { builtinBehaviors, builtinStyles } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { behaviorId, nextBehaviorId, nextStyleId } from '@pubstudio/frontend/util-ids'
import { iterateComponent } from '@pubstudio/frontend/util-render'
import {
  resolveBehavior,
  resolveStyle,
  themeVariableSyntaxRegex,
} from '@pubstudio/frontend/util-resolve'
import {
  parseNamespace,
  replacePastedComponentNamespace,
} from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { useToast } from '@pubstudio/frontend/util-ui-alert'
import { ISetBehaviorData } from '@pubstudio/shared/type-command-data'
import {
  IBehavior,
  IBreakpoint,
  IBreakpointStyles,
  IComponent,
  ICopiedComponent,
  ISerializedComponent,
  IStyle,
  ITheme,
  ITranslations,
} from '@pubstudio/shared/type-site'
import { CssValue } from '@pubstudio/shared/util-parse'
import { useBuild } from './use-build'

// Export functions for testing
export interface IUseCopyPaste {
  pressCopy(evt: KeyboardEvent): void
  pressPaste(evt: KeyboardEvent): Promise<void>
  pasteStyle(copiedComponent: ISerializedComponent): void
  pasteComponent(copiedComponent: ISerializedComponent): void
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

export const useCopyPaste = (): IUseCopyPaste => {
  const {
    site,
    editor,
    mergeComponentStyle,
    pasteComponent: executePasteComponent,
    pasteExternalComponent,
  } = useBuild()
  const { addHUD } = useToast()

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
        component: serialized,
        breakpoints: context.breakpoints,
        translations,
        behaviors,
        styles,
        theme,
      }
      site.value.editor.copiedComponent = serialized
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

  const pasteStyle = (copiedComponent: ISerializedComponent): void => {
    mergeComponentStyle(copiedComponent)
    addHUD({ text: 'Style Pasted' })
  }

  const pasteComponent = (copiedComponent: ISerializedComponent): void => {
    const { selectedComponent } = site.value.editor ?? {}
    if (!selectedComponent) return

    // If the copied component is still selected, paste to its parent
    if (copiedComponent.id === selectedComponent.id) {
      const parent = selectedComponent.parent
      if (parent) {
        executePasteComponent(copiedComponent, parent)
      }
    } else {
      executePasteComponent(copiedComponent, selectedComponent)
    }
    addHUD({ text: 'Component Pasted' })
  }

  const deduplicateExternalComponent = (
    copiedComponent: ICopiedComponent,
  ): ICopiedComponent => {
    const { styles, component, behaviors, translations, breakpoints, theme } =
      copiedComponent
    const currentStyles = Object.values(site.value.context.styles)
    const newStyles: Record<string, IStyle> = {}
    const styleIdMap: Record<string, string> = {}

    const currentBehaviors = Object.values(site.value.context.behaviors)
    const newBehaviors: Record<string, IBehavior> = {}
    const behaviorIdMap: Record<string, string> = {}
    // Remove behaviors that already exist in the target site
    for (const behavior of behaviors) {
      const builtinBehavior = builtinBehaviors[behavior.id]
      if (builtinBehavior && !resolveBehavior(site.value.context, behavior.id)) {
        newBehaviors[behavior.id] = behavior
      } else {
        const existingBehavior = currentBehaviors.find((b) => b.name === behavior.name)
        if (existingBehavior) {
          styleIdMap[behavior.id] = existingBehavior.id
        } else {
          const newBehaviorId = nextBehaviorId(site.value.context)
          behaviorIdMap[behavior.id] = newBehaviorId
          behavior.id = newBehaviorId
          newBehaviors[behavior.id] = behavior
        }
      }
    }
    // Map source site breakpoints to target site.
    // Only include breakpoints that are actually used in components and styles
    // Breakpoints that can't be mapped will be created
    const newBreakpoints: Record<string, IBreakpoint> = {}

    // Remove styles that already exist in the target site
    // Map source site ID to target site ID
    for (const style of styles) {
      for (const bp of Object.keys(style.breakpoints)) {
        if (!newBreakpoints[bp]) {
          newBreakpoints[bp] = breakpoints[bp]
        }
      }
      const styleCmd = makeAddBuiltinStyleMixin(site.value.context, style.id)
      if (builtinStyles[style.id]) {
        // TODO -- this is messy, it's cleaner to generate command data separately
        // In this case it works because the style is used directly as command data in pasteExternalComponent
        if (styleCmd) {
          newStyles[style.id] = styleCmd.data as IStyle
        }
      } else {
        const existingStyle = currentStyles.find((s) => s.name === style.name)
        if (existingStyle) {
          styleIdMap[style.id] = existingStyle.id
        } else {
          const newStyleId = nextStyleId(site.value.context)
          styleIdMap[style.id] = newStyleId
          style.id = newStyleId
          newStyles[style.id] = style
        }
      }
    }

    iterateComponent(component, (cmp) => {
      cmp.style.mixins = cmp.style.mixins?.map((mId) => styleIdMap[mId] ?? mId)
      // Add used breakpoints to list
      for (const bp of Object.keys(cmp.style.custom)) {
        if (!newBreakpoints[bp]) {
          newBreakpoints[bp] = breakpoints[bp]
        }
      }
      if (cmp.events) {
        for (const ev of Object.values(cmp.events)) {
          for (const behavior of ev.behaviors) {
            const bId = behavior.behaviorId
            behavior.behaviorId = behaviorIdMap[bId] ?? bId
          }
        }
      }
    })
    return {
      component,
      breakpoints: newBreakpoints,
      translations,
      behaviors: Object.values(behaviors),
      styles: Object.values(newStyles),
      theme,
    }
  }

  // Attempt to paste a component from the clipboard. Return true if successful
  const pasteClipboardComponent = async (): Promise<boolean> => {
    const { selectedComponent } = site.value.editor ?? {}
    if (!selectedComponent) return false
    try {
      // Iterate over all clipboard items.
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          // Discard any types that are not pubstudio's custom format
          if (type !== 'web text/pubstudio') {
            continue
          }
          const blob = await clipboardItem.getType(type)
          let copiedComponent = JSON.parse(await blob.text()) as ICopiedComponent
          const oldNamespace = parseNamespace(copiedComponent.component.id)
          if (!oldNamespace) {
            return false
          }
          copiedComponent = deduplicateExternalComponent(copiedComponent)
          const replaced = replacePastedComponentNamespace(
            site.value.context,
            copiedComponent,
            oldNamespace,
          )
          if (!replaced) {
            return false
          }
          pasteExternalComponent(copiedComponent, selectedComponent)
          addHUD({ text: 'Component Pasted' })
          return true
        }
      }
    } catch (err) {
      console.error('Failed to paste from clipboard', err)
    }
    return false
  }

  const pressPaste = async (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    if (await pasteClipboardComponent()) {
      return
    }
    const selectedComponent = site.value.editor?.selectedComponent
    const copiedComponent = site.value.editor?.copiedComponent
    if (selectedComponent && copiedComponent) {
      if (evt.shiftKey) {
        // Make sure we don't paste style to the same component
        if (selectedComponent.id !== copiedComponent.id) {
          pasteStyle(copiedComponent)
        }
      } else {
        if (!copiedComponent.parentId) {
          // Root component should not be pasted through paste hotkey.
          addHUD({
            text: 'Root component can only be used to replace another root component',
            duration: 2000,
          })
        } else {
          pasteComponent(copiedComponent)
        }
      }
    }
  }

  return {
    pressCopy,
    pressPaste,
    pasteStyle,
    pasteComponent,
  }
}
