import { computed } from 'vue'
import { builderContext } from './builder-context'

// Set tabindex to -1 when right menu is not focused to make right menu inputs not tab-focusable when
// right menu is not focused. In the builder, we can select the next component by pressing Tab
// continuously. However, if the next component is currently not in the viewport, after the
// scrollToComponent operation, the subsequent Tab press will focus on the first size input
// instead of selecting the next component.
export const rightMenuTabIndex = computed(() =>
  builderContext.rightMenuFocused.value ? 1 : -1,
)
