<template>
  <div class="menu-row">
    <PSMultiselect
      :value="mixin?.id"
      class="edit-item"
      :placeholder="t('style.select')"
      :options="mixinOptions"
      :searchable="true"
      :clearable="false"
      @select="emit('set', { oldMixinId: mixin?.id, newMixinId: $event.value })"
      @click.stop
    />
    <Edit v-if="mixin?.id" class="edit-icon" @click="emit('edit', mixin.id)" />
    <Minus class="item-delete" @click.stop="emit('remove', mixin?.id)" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { IStyle } from '@pubstudio/shared/type-site'
import { Edit, Minus, PSMultiselect } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

defineProps<{
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
}>()
</script>

<style lang="postcss" scoped>
.menu-row {
  :deep(.ps-multiselect) {
    width: 100%;
    margin-right: 16px;
    max-width: 200px;
  }
  .edit-icon {
    margin-left: auto;
  }
}
</style>
