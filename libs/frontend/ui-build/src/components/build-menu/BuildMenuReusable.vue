<template>
  <div class="reusable-menu">
    <div class="title">
      {{ t('build.reusable_components') }}
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

const { t } = useI18n()

const { site } = useBuild()

const topLevelReusableComponents = computed(() =>
  Object.values(site.value.context.reusableComponents ?? {}).filter(
    (reusableCmp) => reusableCmp.parentId === undefined,
  ),
)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.reusable-menu {
  @mixin flex-col;
  height: 100%;
  width: 200px;
  padding: 12px 0;
  background-color: $blue-100;
  overflow: auto;
}

.title {
  @mixin title-semibold 15px;
  padding: 0 8px;
  margin-bottom: 8px;
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
