<template>
  <div class="custom-menu">
    <div class="title">
      {{ t('build.custom_components') }}
    </div>

    <div v-if="topLevelCustomComponents.length === 0" class="custom-empty">
      {{ t('build.custom_empty') }}
    </div>
    <CustomComponent
      v-for="cmp in topLevelCustomComponents"
      :key="cmp.id"
      :customComponent="cmp"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent } from '@pubstudio/shared/type-site'
import CustomComponent from './CustomComponent.vue'

const { t } = useI18n()

const { site } = useBuild()

const topLevelCustomComponents = computed<IComponent[]>(() => {
  const { context } = site.value
  const ids = context?.customComponentIds.values() ?? []
  return Array.from(ids)
    .map((id) => resolveComponent(context, id))
    .filter((cmp) => !!cmp) as IComponent[]
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.custom-menu {
  @mixin flex-col;
  height: 100%;
  width: $left-menu-width;
  padding: 24px 0 16px;
  background-color: $blue-100;
  overflow: auto;
}

.title {
  @mixin title-semibold 15px;
  padding: 0 8px;
  margin-bottom: 8px;
}
.custom-empty {
  @mixin title-medium 15px;
  color: $grey-500;
  padding: 16px 4px 4px 16px;
}

.custom-cmp {
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
