<template>
  <div class="theme-meta-wrap">
    <div class="theme-meta">
      <MenuRow
        label="Title"
        :value="site.defaults.head.title ?? site.name"
        :editable="true"
        :showCheck="true"
        placeholder="Title"
        @update="setTitle(site, $event)"
      />
      <ThemeMetaDescription
        :value="site.defaults.head.description"
        @update="setDescription(site, $event)"
      />
      <ThemeMetaFavicon :favicon="favicon" @setFavicon="setFavicon(site, $event)" />
      <ThemeMetaHead
        :head="site.defaults.head"
        :includeBase="true"
        @add="add"
        @set="set"
        @remove="remove"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  addDefaultsHead,
  setDefaultsHead,
  removeDefaultsHead,
  setFavicon,
  setTitle,
  setDescription,
} from '@pubstudio/frontend/feature-build'
import { IHeadTag, IHeadObject } from '@pubstudio/shared/type-site'
import ThemeMetaFavicon from './ThemeMetaFavicon.vue'
import ThemeMetaHead from './ThemeMetaHead.vue'
import ThemeMetaDescription from './ThemeMetaDescription.vue'
import MenuRow from '../MenuRow.vue'
import { IThemeMetaEditData } from './i-theme-meta-edit-data'

const { site } = useSiteSource()

const add = (data: IThemeMetaEditData) => {
  const { tag, meta } = data
  addDefaultsHead(site.value, tag as IHeadTag, meta as IHeadObject)
}

const set = (data: IThemeMetaEditData) => {
  const { tag, index, meta } = data
  setDefaultsHead(site.value, tag as IHeadTag, index, meta as IHeadObject)
}

const remove = (tag: IHeadTag, index: number) => {
  removeDefaultsHead(site.value, tag, index)
}

const favicon = computed(() => {
  const link = site.value.defaults.head.link?.find((link) => link.rel === 'icon')
  return link?.href
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-meta-wrap {
  @mixin menu;
  padding: 0;
  width: 100%;
}
.theme-meta {
  width: 100%;
}
</style>
