<template>
  <div class="page-item-wrap">
    <div class="text" @click="emit('click')">
      <Caret :class="{ active }" class="caret" />
      {{ text }}
    </div>
    <div v-if="!editing" class="edit-wrap" @click="emit('edit')">
      <Edit class="edit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Caret, Edit } from '@pubstudio/frontend/ui-widgets'

defineProps<{
  text: string
  active?: boolean
  editing?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'edit'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.page-item-wrap {
  @mixin flex-row;
  justify-content: space-between;
  width: 100%;
  padding-right: 6px;
}
.text {
  @mixin flex-row;
  @mixin title-medium 13px;
  width: 100%;
  color: $color-title;
  justify-content: flex-start;
  align-items: center;
  transition: color 0.2s;
  cursor: pointer;
  padding: 6px 6px 4px 6px;

  &:hover {
    color: $color-toolbar-button-active;
    :deep(path) {
      fill: $color-toolbar-button-active;
    }
  }
}
.caret {
  @mixin size 22px;
  visibility: hidden;
}
.active {
  visibility: visible;
}
.edit-wrap {
  @mixin flex-center;
  margin-left: 8px;
  padding: 0 6px;
  height: 100%;
  cursor: pointer;
  &:hover {
    .edit :deep(path) {
      stroke: $color-toolbar-button-active;
    }
  }
}
.edit {
  @mixin size 20px;
  &:deep(path) {
    transition: stroke 0.2s;
  }
}
</style>
