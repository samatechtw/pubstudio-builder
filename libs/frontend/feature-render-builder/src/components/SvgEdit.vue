<template>
  <div class="svg-edit">
    <Edit color="white" class="edit-icon" @click="editSvg" />
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
  position: relative;
  margin-top: -100%;
  .edit-icon {
    position: absolute;
    top: -32px;
    right: -24px;
    width: 26px;
    height: 26px;
  }
}
</style>
