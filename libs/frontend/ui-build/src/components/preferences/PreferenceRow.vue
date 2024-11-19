<template>
  <div class="preference-row">
    <div class="row-left">
      <div class="row-label">
        {{ label }}
      </div>
      <div class="row-text">
        {{ text }}
      </div>
    </div>
    <div class="row-right">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()

defineProps<{
  label: string
  text: string
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.preference-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid $border1;
  padding: 12px 0;
}
.row-label {
  @mixin title-bold 14px;
}
.row-right {
  margin-left: 16px;
}
</style>
