<template>
  <div class="page-meta">
    <div class="subtitle">
      {{ t('build.meta_text') }}
    </div>
    <ThemeMetaFavicon :favicon="favicon" @setFavicon="setFavicon" />
    <ThemeMetaHead
      v-if="activePage"
      :head="activePage.head"
      @add="add"
      @set="set"
      @remove="remove"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IHeadTag } from '@pubstudio/shared/type-site'
import { useBuild } from '../../lib/use-build'
import ThemeMetaFavicon from '../theme-menu/ThemeMetaFavicon.vue'
import ThemeMetaHead from '../theme-menu/ThemeMetaHead.vue'
import { IThemeMetaEditData } from '../theme-menu/i-theme-meta-edit-data'

const { t } = useI18n()
const { activePage, setPageFavicon, addPageHead, setPageHead, removePageHead } =
  useBuild()

const setFavicon = (newFavicon: string | undefined) => {
  if (activePage.value) {
    setPageFavicon(activePage.value.route, newFavicon)
  }
}
const add = (data: IThemeMetaEditData) => {
  if (activePage.value) {
    const { tag, meta } = data
    addPageHead(activePage.value.route, tag, meta)
  }
}

const set = (data: IThemeMetaEditData) => {
  if (activePage.value) {
    const { tag, index, meta } = data
    setPageHead(activePage.value.route, tag, index, meta)
  }
}

const remove = (tag: IHeadTag, index: number) => {
  if (activePage.value) {
    removePageHead(activePage.value.route, tag, index)
  }
}

const favicon = computed(() => {
  const link = activePage.value?.head.link?.find((link) => link.rel === 'icon')
  return link?.href
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.subtitle {
  @mixin text 15px;
  margin-bottom: 16px;
}
</style>
