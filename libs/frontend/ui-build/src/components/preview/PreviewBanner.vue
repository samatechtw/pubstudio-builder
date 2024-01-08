<template>
  <div class="preview-banner" @click="goBack">
    {{ t('build.preview_banner') }}
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const goBack = () => {
  const siteId = route.query.siteId as string | undefined
  const { back } = router.options.history.state
  if (back?.toString().startsWith('/build')) {
    router.go(-1)
  } else if (siteId) {
    router.replace({
      name: 'Build',
      params: { siteId },
    })
  } else {
    router.replace({ name: 'BuildScratch' })
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.preview-banner {
  @mixin flex-center;
  @mixin title-medium 12px;
  height: 28px;
  cursor: pointer;
  background-color: #eee489;
}
</style>
