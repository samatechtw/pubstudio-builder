<template>
  <div v-if="definition" class="component-edit-bar">
    <div class="component-edit-text">
      {{ t('build.editing_component', { name: definition.name }) }}
    </div>
    <div class="component-edit-hint">{{ t('build.arena_hint') }}</div>
    <PSButton
      class="component-edit-done"
      size="small"
      :text="t('build.done_editing')"
      @click="done"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { exitComponentEdit } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { PSButton } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()
const { site, editor } = useSiteSource()

const definition = computed(() => {
  const id = editor.value?.editingComponentId
  return id ? site.value.context.components[id] : undefined
})

const done = () => {
  exitComponentEdit(site.value)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-edit-bar {
  @mixin flex-row;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background-color: $blue-100;
  border-bottom: 1px solid $border1;
}
.component-edit-text {
  @mixin title-semibold 14px;
}
.component-edit-hint {
  @mixin text 12px;
  color: $grey-500;
  flex-grow: 1;
}
</style>
