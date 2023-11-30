<template>
  <div class="menu-row">
    <PSMultiselect
      :value="mixin?.id"
      class="edit-item"
      :placeholder="t('style.select')"
      :options="mixinOptions"
      :searchable="true"
      :clearable="false"
      @select="
        emit('set', { oldMixinId: mixin?.id, newMixinId: $event?.value as string })
      "
      @click.stop
    />

    <IconTooltipDelay ref="flattenRef" :tip="t('style.flatten')" class="flatten">
      <ScaleOut v-if="!isNew" class="out-icon" @click="flatten" />
    </IconTooltipDelay>
    <Edit v-if="mixin?.id" class="edit-icon" @click="emit('edit', mixin.id)" />
    <Minus class="item-delete" @click.stop="emit('remove', mixin?.id)" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IStyle } from '@pubstudio/shared/type-site'
import {
  Edit,
  IconTooltipDelay,
  Minus,
  PSMultiselect,
  ScaleOut,
} from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

defineProps<{
  isNew?: boolean
  mixin?: IStyle | undefined
  mixinOptions: { label: string; value: string }[]
}>()

interface ISetMixinEmit {
  oldMixinId?: string
  newMixinId: string
}

const emit = defineEmits<{
  (e: 'set', data: ISetMixinEmit): void
  (e: 'edit', mixinId: string): void
  (e: 'remove', mixinId: string | undefined): void
  (e: 'flatten'): void
}>()

const flattenRef = ref()

const flatten = () => {
  flattenRef.value?.cancelHoverTimer()
  emit('flatten')
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.menu-row {
  :deep(.ps-multiselect) {
    width: 100%;
    margin-right: 16px;
    max-width: 200px;
  }
  .out-icon {
    @mixin size 20px;
    margin-left: auto;
  }
  .edit-icon {
    margin-left: 6px;
  }
}
.flatten {
  &:hover :deep(path) {
    fill: $color-toolbar-button-active;
  }
}
</style>
