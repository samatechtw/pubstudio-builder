<template>
  <div class="component-tab-style">
    <ComponentStyles />
    <ComponentMenuMixins :component="component" />
    <ComponentChildStyles
      v-if="hasOverrideStyles || hasChildren"
      :component="component"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { overrideSelectorIds } from '@pubstudio/frontend/util-render'
import { IComponent } from '@pubstudio/shared/type-site'
import ComponentMenuMixins from './ComponentMenuMixins.vue'
import ComponentChildStyles from './ComponentChildStyles.vue'
import ComponentStyles from './ComponentStyles.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { site } = useSiteSource()

const hasOverrideStyles = computed(
  () => Object.keys(component.value.style.overrides ?? {}).length > 0,
)

// An instance has no children of its own, but the children it expands are selectable
const hasChildren = computed(
  () => overrideSelectorIds(site.value.context, component.value).length > 0,
)
</script>

<style lang="postcss" scoped>
.component-tab-style {
  width: 100%;
}
</style>
