<template>
  <div class="page-meta">
    <div class="subtitle">
      {{ t('build.meta_text') }}
    </div>
    <ThemeMetaDescription
      :value="
        page?.head.meta?.find((m) => m.name === 'description')?.content ??
        site.defaults.head.description
      "
      @update="setDescription($event)"
    />
    <ThemeMetaFavicon :favicon="favicon" @setFavicon="setFavicon" />
    <ThemeMetaHead
      v-if="page"
      :head="page.head"
      :includeTitle="true"
      @add="add"
      @set="set"
      @remove="remove"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IHeadTagStr, IPageHeadTag } from '@pubstudio/shared/type-site'
import {
  addPageHead,
  removePageHead,
  setPageDescription,
  setPageFavicon,
  setPageHead,
} from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import ThemeMetaFavicon from '../theme-menu/ThemeMetaFavicon.vue'
import ThemeMetaDescription from '../theme-menu/ThemeMetaDescription.vue'
import ThemeMetaHead from '../theme-menu/ThemeMetaHead.vue'
import { IThemeMetaEditData } from '../theme-menu/i-theme-meta-edit-data'

const { t } = useI18n()
const { site } = useSiteSource()

const route = computed(() => site.value.editor?.editPageRoute)
const page = computed(() => (route.value ? site.value.pages[route.value] : undefined))

const setFavicon = (newFavicon: string | undefined) => {
  if (route.value) {
    setPageFavicon(site.value, route.value, newFavicon)
  }
}
const setDescription = (newDescription: string | undefined) => {
  if (route.value && newDescription !== undefined) {
    setPageDescription(site.value, route.value, newDescription)
  }
}
const add = (data: IThemeMetaEditData) => {
  if (route.value) {
    const { tag, meta } = data
    addPageHead(site.value, route.value, tag as IPageHeadTag, meta)
  }
}

const set = (data: IThemeMetaEditData) => {
  if (route.value) {
    const { tag, index, meta } = data
    setPageHead(site.value, route.value, tag as IPageHeadTag, index, meta)
  }
}

const remove = (tag: IHeadTagStr, index: number) => {
  if (route.value) {
    removePageHead(site.value, route.value, tag as IPageHeadTag, index)
  }
}

const favicon = computed(() => {
  const link = page.value?.head.link?.find((link) => link.rel === 'icon')
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
