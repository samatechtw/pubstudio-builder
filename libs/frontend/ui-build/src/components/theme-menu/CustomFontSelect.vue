<template>
  <div class="custom-font-select">
    <PSInput v-model="nameModel" :placeholder="t('theme.font_name')" class="item" />
    <PSInput
      v-model="urlModel"
      :placeholder="t('theme.font_url')"
      class="item font-url"
    />
  </div>
</template>

<script lang="ts" setup>
import { PSInput } from '@pubstudio/frontend/ui-widgets'
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()

const nameModel = defineModel<string>('name')
const urlModel = defineModel<string>('url')
</script>

<style lang="postcss" scoped>
.custom-font-select {
  max-width: 200px;
  width: 100%;
  margin-right: 0;
}
.font-url {
  margin-top: 8px;
}
</style>
