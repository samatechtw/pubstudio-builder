<template>
  <div class="style-menu-list">
    <EditMenuTitle :title="t('style.reusable')" @add="newStyle" />
    <div v-if="styles.length" class="styles">
      <div v-for="style in styles" :key="style.id" class="style-entry edit-item">
        <div class="style-name" @click="setEditingMixin(site, style.id, undefined)">
          {{ style.name }}
        </div>
        <Minus class="item-delete" @click="deleteStyle(style)" />
      </div>
    </div>
    <div v-else class="styles-empty">
      {{ t('style.no_styles') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Minus } from '@pubstudio/frontend/ui-widgets'
import { useBuild, useReusableStyleMenu } from '@pubstudio/frontend/feature-build'
import EditMenuTitle from './EditMenuTitle.vue'
import { setEditingMixin } from '@pubstudio/frontend/util-command'

const { t } = useI18n()

const { newStyle } = useReusableStyleMenu()
const { deleteStyle, site } = useBuild()

const styles = computed(() => {
  return Object.values(site.value?.context.styles ?? {})
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.style-menu-list {
  .styles {
    width: 100%;
  }
  .style-entry {
    padding: 10px 0;
    justify-content: space-between;
    border-bottom: 1px solid $grey-100;
    cursor: default;
  }
  .style-name {
    @mixin text 14px;
    flex-grow: 1;
    cursor: pointer;
  }
  .styles-empty {
    @mixin text-medium 18px;
    padding-top: 24px;
    color: $grey-500;
  }
}
</style>
