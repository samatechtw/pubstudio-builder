<template>
  <div class="svg-edit">
    <Edit color="black" class="edit-icon" @click="editSvg" />
  </div>
</template>

<script lang="ts" setup>
import { Edit } from '@pubstudio/frontend/ui-widgets'
import { setEditSvg } from '@pubstudio/frontend/util-command'
import { useBuild } from '@pubstudio/frontend/feature-build'

const { editor } = useBuild()

const editSvg = () => {
  if (editor.value && editor.value.selectedComponent) {
    setEditSvg(editor.value, { content: editor.value.selectedComponent.content ?? '' })
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.svg-edit {
  @mixin flex-center;
  position: absolute;
  top: -28px;
  right: -28px;
  .edit-icon {
    width: 26px;
    height: 26px;
    filter: drop-shadow(0px 0px 1.5px rgb(255 255 255 / 0.9));
  }
}
</style>
