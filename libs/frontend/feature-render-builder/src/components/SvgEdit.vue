<template>
  <div class="svg-edit" :style="{ top: `${offsetTop}px` }">
    <Edit color="black" class="edit-icon" @click="editSvg" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { Edit } from '@pubstudio/frontend/ui-widgets'
import { setEditSvg } from '@pubstudio/frontend/data-access-command'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { computeComponentOffset } from '@pubstudio/frontend/util-builder'

const { editor, site } = useBuild()
const offsetTop = ref(-28)

const props = defineProps<{
  componentId: string
}>()
const { componentId } = toRefs(props)

const editSvg = () => {
  if (editor.value && editor.value.selectedComponent) {
    setEditSvg(editor.value, { content: editor.value.selectedComponent.content ?? '' })
  }
}

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

.svg-edit {
  @mixin flex-center;
  position: absolute;
  right: -28px;
  .edit-icon {
    @mixin size 26px;
    filter: drop-shadow(0px 1px 6px rgb(255 255 255 / 0.9));
  }
}
</style>
