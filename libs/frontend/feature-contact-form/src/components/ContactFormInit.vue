<template>
  <div class="init-wrap">
    <div class="init-title">
      {{ t('custom_data.contact') }}
    </div>
    <div class="init-text">
      {{ t('custom_data.init') }}
    </div>
    <div class="contact-form-init">
      <div class="button-wrap">
        <div class="link-table button" @click="linkTable">
          {{ t('custom_data.link') }}
        </div>
      </div>
      <div class="button-wrap">
        <div class="create-table button" @click="createTable">
          {{ t('custom_data.create') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { setContactFormWalkthrough } from '@pubstudio/frontend/data-access-command'
import { ContactFormWalkthroughState } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()
const { editor } = useBuild()

const linkTable = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.LinkTable)
}

const createTable = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.CreateTable)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.init-wrap {
  @mixin flex-col;
  min-height: 300px;
  width: 100%;
  height: 100%;
  color: black;
}
.contact-form-init {
  @mixin flex-center;
  flex-grow: 1;
  color: white;
}
.init-text {
  @mixin title-thin 18px;
  margin-top: 32px;
  text-align: center;
}
.init-title {
  @mixin title 22px;
  text-align: center;
}
.button-wrap {
  @mixin flex-center;
  width: 50%;
  height: 100%;
}
.button {
  @mixin flex-center;
  @mixin title-medium 18px;
  width: 140px;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.85;
  }
}
.link-table {
  background-color: $purple-500;
}
.create-table {
  background-color: $blue-500;
}
</style>
