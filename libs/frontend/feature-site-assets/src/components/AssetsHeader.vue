<template>
  <div class="header">
    <div class="title-wrap">
      <div class="content-title">
        {{ t('assets.title') }}
      </div>
      <div class="subtitle">
        <span>{{ t('assets.subtitle') }}</span>

        <I18nT
          v-if="!hasSites"
          keypath="assets.subtitle_no_sites"
          class="no-sites"
          tag="span"
        >
          <router-link :to="{ name: 'Sites' }">
            {{ t('sites.title') }}
          </router-link>
        </I18nT>
      </div>
    </div>
    <PSButton
      v-if="hasSites"
      class="create-button"
      :animate="loadingSites"
      @click="emit('upload')"
    >
      <div class="button-content">
        <Plus color="white" class="button-plus" />
        {{ t('upload') }}
      </div>
    </PSButton>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { I18nT } from '@pubstudio/frontend/util-i18n'
import { PSButton, Plus } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

defineProps<{
  hasSites?: boolean
  loadingSites?: boolean
}>()
const emit = defineEmits<{
  (e: 'upload'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content-title {
  color: black;
}
.subtitle {
  @mixin title 16px;
  color: $grey-700;
}
.no-sites {
  margin-left: 6px;
  a {
    color: $color-primary;
  }
}

.create-button {
  padding: 0 16px 0 12px;
}
.button-content {
  @mixin flex-row;
  align-items: center;
}
.button-plus {
  height: 20px;
  margin-right: 8px;
}
</style>
