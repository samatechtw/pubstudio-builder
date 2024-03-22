<template>
  <div class="component-tab-style">
    <ComponentStyles />
    <ComponentMenuMixins :mixins="mixins" />
    <ComponentChildStyles
      v-if="hasOverrideStyles || !!component.children?.length"
      :component="component"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { IComponent } from '@pubstudio/shared/type-site'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { useBuild } from '@pubstudio/frontend/feature-build'
import ComponentMenuMixins from './ComponentMenuMixins.vue'
import ComponentChildStyles from './ComponentChildStyles.vue'
import ComponentStyles from './ComponentStyles.vue'
import { IComponentMixin } from './i-component-mixin'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { site } = useBuild()

const hasOverrideStyles = computed(
  () => Object.keys(component.value.style.overrides ?? {}).length > 0,
)

const mixins = computed(() => {
  // Keep track of used mixins so that mixins with the same id
  // will only be displayed once.
  // Key: mixinId, value: sourceReusableComponentId
  const mixinSources = new Map<string, string | undefined>()

  const reusableCmp = resolveComponent(
    site.value.context,
    component.value.reusableSourceId,
  )

  if (reusableCmp) {
    // Append mixins from reusable component
    reusableCmp.style.mixins?.forEach((mixinId) => {
      mixinSources.set(mixinId, reusableCmp.id)
    })
  }

  // Append mixins from component
  component.value.style.mixins?.forEach((mixinId) => {
    mixinSources.set(mixinId, undefined)
  })

  const mixins: IComponentMixin[] = Array.from(mixinSources).map(
    ([mixinId, sourceReusableComponentId]) => ({
      id: mixinId,
      sourceReusableComponentId,
    }),
  )

  return mixins
})
</script>

<style lang="postcss" scoped>
.component-tab-style {
  width: 100%;
}
</style>
