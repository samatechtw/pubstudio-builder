<template>
  <div class="init-wrap">
    <div class="init-title">
      {{ t('custom_data.mailing') }}
    </div>
    <div class="init-text">
      {{ t('custom_data.init_mailing') }}
    </div>
    <div class="walkthrough-init">
      <div class="button-wrap">
        <div class="create-table button" @click="createTable">
          {{ t('custom_data.create') }}
        </div>
      </div>
      <div class="button-wrap">
        <div class="link-table button" @click="linkTable">
          {{ t('custom_data.link') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { setMailingListWalkthrough } from '@pubstudio/frontend/data-access-command'
import { MailingListWalkthroughState } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()
const { editor } = useSiteSource()

const linkTable = () => {
  setMailingListWalkthrough(editor.value, MailingListWalkthroughState.LinkTable)
}

const createTable = () => {
  setMailingListWalkthrough(editor.value, MailingListWalkthroughState.CreateTable)
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
.walkthrough-init {
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
