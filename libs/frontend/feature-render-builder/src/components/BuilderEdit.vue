<template>
  <div class="builder-edit" :style="{ top: `${offsetTop}px` }">
    <Edit color="black" class="edit-icon" @click="emit('click')" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { Edit } from '@pubstudio/frontend/ui-widgets'
import { computeComponentOffset } from '@pubstudio/frontend/util-builder'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { site } = useSiteSource()
const offsetTop = ref(-28)

const props = defineProps<{
  componentId: string
}>()
const { componentId } = toRefs(props)
const emit = defineEmits<{ (e: 'click'): void }>()

const computeOffset = () => {
  offsetTop.value = computeComponentOffset(componentId.value) ?? offsetTop.value
}

watch(() => site.value.context.components?.[componentId.value], computeOffset, {
  deep: true,
})

onMounted(() => {
  computeOffset()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.builder-edit {
  @mixin flex-center;
  position: absolute;
  .edit-icon {
    @mixin size 26px;
    filter: drop-shadow(0px 1px 6px rgb(255 255 255 / 0.9));
  }
}
</style>
