<template>
  <div class="component-tab-style">
    <ComponentStyles />
    <ComponentMenuMixins :mixinIds="component.style.mixins ?? []" />
    <ComponentChildStyles
      v-if="hasOverrideStyles || !!component.children?.length"
      :component="component"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { IComponent } from '@pubstudio/shared/type-site'
import ComponentMenuMixins from './ComponentMenuMixins.vue'
import ComponentChildStyles from './ComponentChildStyles.vue'
import ComponentStyles from './ComponentStyles.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const hasOverrideStyles = computed(
  () => Object.keys(component.value.style.overrides ?? {}).length > 0,
)
</script>

<style lang="postcss" scoped>
.component-tab-style {
  width: 100%;
}
</style>
