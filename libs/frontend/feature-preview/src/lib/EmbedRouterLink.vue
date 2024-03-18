<template>
  <a
    class="router-link"
    :class="{ 'router-link-active': isActive, 'router-link-exact-active': isActive }"
    :href="link.url"
    :target="link.isExternal ? '_blank' : undefined"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { INavigateOptions, normalizeUrl } from '@pubstudio/frontend/util-router'
import { computed, toRefs } from 'vue'
import { getActivePath, setActivePath } from './embed-active-page'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const props = defineProps<{
  to: INavigateOptions | string
}>()

const { to } = toRefs(props)
const { site } = useSiteSource()

const link = computed(() => {
  if (typeof to.value === 'string') {
    const url = to.value as string
    return {
      url,
      isExternal: !url.startsWith('/'),
    }
  }
  if ('name' in to.value) {
    return { url: toRoute.value, isExternal: false }
  } else {
    const { url } = normalizeUrl(to.value.path ?? '')
    return { url, isExternal: true }
  }
})

const toRoute = computed(() => {
  if (typeof to.value === 'string') {
    return to.value as string
  }
  return Object.values(site.value?.pages ?? {}).find((page) => {
    const toOpt = to.value as INavigateOptions
    if ('name' in toOpt && page.name === toOpt.name) {
      return page
    } else if ('path' in toOpt && page.route === toOpt?.path) {
      return page
    }
  })?.route
})

const isActive = computed(() => toRoute.value === getActivePath())

const navigate = (e: Event) => {
  if (!link.value.isExternal) {
    e.preventDefault()
    setActivePath(link.value.url)
  }
}
</script>
