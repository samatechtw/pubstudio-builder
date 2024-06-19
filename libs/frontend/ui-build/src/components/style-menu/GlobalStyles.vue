<template>
  <div class="global-styles-wrap">
    <div class="global-title">
      <div class="label">
        {{ t('style.global') }}
      </div>
      <div class="item new-global-style" @click.stop="newGlobalStyle(site)">
        <Plus class="item-add" />
      </div>
    </div>
    <div v-if="globalStyleNames.length" class="global-styles">
      <div v-for="name in globalStyleNames" :key="name" class="global-entry edit-item">
        <div class="global-name" @click="setEditingGlobalStyle(name)">
          {{ name }}
        </div>
        <Minus class="item-delete" @click="removeGlobalStyle(site, name)" />
      </div>
    </div>
    <div v-else class="global-styles-empty">
      {{ t('style.no_styles') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { Minus, Plus } from '@pubstudio/frontend/ui-widgets'
import { useGlobalStyles } from '@pubstudio/frontend/feature-build'
import { removeGlobalStyle } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()

const { site } = useSiteSource()
const { globalStyleNames, newGlobalStyle, setEditingGlobalStyle } = useGlobalStyles()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.global-styles-wrap {
  @mixin menu;
  align-items: flex-start;
  padding: 0;
  width: 100%;
}
.global-styles {
  width: 100%;
}
.global-title {
  @mixin flex-row;
  @mixin title 15px;
  width: 100%;
  align-items: center;
  .label {
    font-weight: bold;
    flex-grow: 1;
  }
}
.global-entry {
  font-size: 15px;
  width: 100%;
  justify-content: space-between;
  border-bottom: 1px solid $grey-100;
  cursor: default;
}
.global-name {
  flex-grow: 1;
  cursor: pointer;
  padding: 12px 0;
}
.global-styles-empty {
  @mixin title-medium 15px;
  padding-top: 16px;
  color: $grey-500;
}
</style>
