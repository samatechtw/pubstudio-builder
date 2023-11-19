<template>
  <div class="component-style">
    <ComponentStyles />
    <ComponentChildStyles v-if="!!component.children?.length" :component="component" />
    <ComponentMenuMixins :mixinIds="component.style.mixins ?? []" />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { IComponent } from '@pubstudio/shared/type-site'
import ComponentMenuMixins from './ComponentMenuMixins.vue'
import ComponentChildStyles from './ComponentChildStyles.vue'
import ComponentStyles from './ComponentStyles.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)
</script>

<style lang="postcss" scoped>
.component-styles {
  width: 100%;
}
</style>
