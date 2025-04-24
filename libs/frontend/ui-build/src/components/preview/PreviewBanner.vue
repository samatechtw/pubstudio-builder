<template>
  <div class="preview-banner" @click="goBack">
    <div class="banner-content">
      <div class="go-back">
        {{ t('build.preview_banner') }}
      </div>
      <div class="print-wrap" @click.stop="emit('print')">
        <Print class="print" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { Print } from '@pubstudio/frontend/ui-widgets'
import { useRoute, useRouter } from '@pubstudio/frontend/util-router'

const emit = defineEmits<{
  (e: 'print'): void
}>()

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const goBack = () => {
  const siteId = route.value?.query.siteId as string | undefined
  if (siteId) {
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
  position: relative;
  z-index: 9999;
}
.banner-content {
  @mixin flex-center;
  max-width: 1020px;
  margin: 0 auto;
  padding: 0 32px;
}
.go-back {
  margin-left: auto;
}
.print-wrap {
  @mixin flex-center;
  padding: 0 8px;
  height: 100%;
  margin-left: auto;
}
.print {
  height: 24px;
}
@media (max-width: 480px) {
  .banner-content {
    padding: 0 8px;
  }
}
</style>
