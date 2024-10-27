<template>
  <div class="custom-font-select">
    <STInput v-model="nameModel" :placeholder="t('theme.font_name')" class="item" />
    <STInput
      v-model="urlModel"
      :placeholder="t('theme.font_url')"
      class="item font-url"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'

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
