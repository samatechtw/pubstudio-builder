<template>
  <div class="reusable-menu">
    <div class="title">
      {{ t('build.reusable_components') }}
    </div>

    <div v-if="topLevelReusableComponents.length === 0" class="reusable-empty">
      {{ t('build.reusable_empty') }}
    </div>
    <ReusableComponent
      v-for="cmp in topLevelReusableComponents"
      :key="cmp.id"
      :reusableComponent="cmp"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import ReusableComponent from './ReusableComponent.vue'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const { site } = useBuild()

const topLevelReusableComponents = computed<IComponent[]>(() => {
  const { context, editor } = site.value
  const ids = editor?.reusableComponentIds.values() ?? []
  return Array.from(ids)
    .map((id) => resolveComponent(context, id))
    .filter((cmp) => !!cmp) as IComponent[]
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.reusable-menu {
  @mixin flex-col;
  height: 100%;
  width: 200px;
  padding: 24px 0 16px;
  background-color: $blue-100;
  overflow: auto;
}

.title {
  @mixin title-semibold 15px;
  padding: 0 8px;
  margin-bottom: 8px;
}
.reusable-empty {
  @mixin title-medium 15px;
  color: $grey-500;
  padding: 16px 4px 4px 16px;
}

.reusable-cmp {
  @mixin title-medium 13px;
  @mixin flex-row;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  color: $color-text;
  border-top: 1px solid $border1;
  border-bottom: 1px solid $border1;
  cursor: pointer;
}
</style>
