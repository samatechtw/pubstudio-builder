<template>
  <div class="logo-text-wrap">
    <Logo class="logo" />
    <div class="text">
      {{ t('title') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Logo from './svg/Logo.vue'

const { t } = useI18n()
</script>

<style lang="postcss" setup>
@import '@theme/css/mixins.postcss';

.logo-text-wrap {
  @mixin flex-row;
  @mixin title-semibold 26px;
  align-items: center;
  cursor: pointer;
  color: white;
}
.logo {
  @mixin size 32px;
  margin-right: 8px;
}
</style>
