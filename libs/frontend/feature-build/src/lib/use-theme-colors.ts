import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { isColor } from '@pubstudio/frontend/util-doc'
import { builtinThemeVariables } from '@pubstudio/frontend/util-ids'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { computed, ComputedRef } from 'vue'

export const MAX_SELECTED_THEME_COLORS = 16

export interface IUseThemeColors {
  selectedThemeColors: ComputedRef<IThemeVariable[]>
}

export const useThemeColors = (): IUseThemeColors => {
  const { site, editor } = useSiteSource()

  const themeColors = computed<IThemeVariable[]>(() => {
    return Object.entries(site.value.context.theme.variables)
      .map(([key, value]) => {
        const resolved = resolveThemeVariables(site.value.context, value) ?? ''
        const variable: IThemeVariable = {
          isColor: isColor(resolved),
          key,
          value,
          resolved,
        }
        return variable
      })
      .sort((a, b) => {
        // Custom colors show first, then builtin colors
        const aIsBuiltinVariable = a.key in builtinThemeVariables
        const bIsBuiltinVariable = b.key in builtinThemeVariables
        if (aIsBuiltinVariable === bIsBuiltinVariable) {
          return 0
        } else if (aIsBuiltinVariable) {
          return 1
        } else {
          return -1
        }
      })
      .filter((variable) => variable.isColor)
  })

  // Returns at most 16 selected theme colors.
  const selectedThemeColors = computed<IThemeVariable[]>(() => {
    const selected = themeColors.value.filter((variable) =>
      editor.value?.selectedThemeColors.has(variable.key),
    )
    return selected.slice(0, MAX_SELECTED_THEME_COLORS)
  })

  return {
    selectedThemeColors,
  }
}
