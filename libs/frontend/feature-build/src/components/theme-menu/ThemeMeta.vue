<template>
  <div class="theme-meta-wrap">
    <div class="theme-meta">
      <ThemeMetaFavicon :favicon="favicon" @setFavicon="setFavicon" />
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
import { useBuild } from '../../lib/use-build'
import ThemeMetaFavicon from './ThemeMetaFavicon.vue'
import ThemeMetaHead from './ThemeMetaHead.vue'
import { IThemeMetaEditData } from './i-theme-meta-edit-data'
import { IHeadTag } from '@pubstudio/shared/type-site'

const { site, setFavicon, addDefaultsHead, setDefaultsHead, removeDefaultsHead } =
  useBuild()

const add = (data: IThemeMetaEditData) => {
  const { tag, meta } = data
  addDefaultsHead(tag, meta)
}

const set = (data: IThemeMetaEditData) => {
  const { tag, index, meta } = data
  setDefaultsHead(tag, index, meta)
}

const remove = (tag: IHeadTag, index: number) => {
  removeDefaultsHead(tag, index)
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
