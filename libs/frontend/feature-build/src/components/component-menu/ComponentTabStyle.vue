<template>
  <div class="component-style">
    <ComponentStyles
      v-if="!editing"
      :styleEntries="styleEntries"
      @addStyle="setStyle(undefined, $event)"
      @updateStyle="setStyle"
      @removeStyle="removeComponentCustomStyle"
    />
    <ComponentMenuMixins :mixinIds="component.style.mixins ?? []" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import {
  Css,
  IComponent,
  IInheritedStyleEntry,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import ComponentStyles from './ComponentStyles.vue'
import ComponentMenuMixins from './ComponentMenuMixins.vue'
import { useBuild } from '../../lib/use-build'
import { useReusableStyleMenu } from '../../lib/use-reusable-style-menu'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const {
  currentPseudoClass,
  selectedComponentFlattenedStyles,
  setComponentCustomStyle,
  setPositionAbsolute,
  removeComponentCustomStyle,
} = useBuild()

const { editing } = useReusableStyleMenu()

const setStyle = (oldStyle: IStyleEntry | undefined, newStyle: IStyleEntry) => {
  if (newStyle.property === Css.Position && newStyle.value === 'absolute') {
    // Makes sure the parent has `relative` or `absolute` style.
    // Otherwise the component might jump to an unexpected location
    setPositionAbsolute(oldStyle, newStyle)
  } else {
    setComponentCustomStyle(oldStyle, newStyle)
  }
}

const styleEntries = computed(() =>
  Object.entries(selectedComponentFlattenedStyles.value).map(
    ([css, source]) =>
      ({
        pseudoClass: currentPseudoClass.value,
        property: css as Css,
        value: source.value,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        sourceBreakpointId: source.sourceBreakpointId,
      }) as IInheritedStyleEntry,
  ),
)
</script>

<style lang="postcss" scoped>
.component-styles {
  width: 100%;
}
</style>
