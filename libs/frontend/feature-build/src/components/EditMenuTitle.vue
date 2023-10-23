<template>
  <div class="menu-subtitle menu-row">
    <div class="label">
      {{ title }}
      <span v-if="subTitle" class="sub-label">
        {{ subTitle }}
      </span>
    </div>
    <div v-if="showAdd" class="item">
      <Plus class="item-add" @click="emit('add')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus } from '@pubstudio/frontend/ui-widgets'

withDefaults(
  defineProps<{
    title: string
    subTitle?: string
    showAdd?: boolean
  }>(),
  {
    subTitle: undefined,
    showAdd: true,
  },
)

const emit = defineEmits<{
  (e: 'add'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.menu-subtitle {
  .sub-label {
    @mixin title-thin 12px;
    color: $grey-500;
    margin-left: 4px;
  }
}
</style>
