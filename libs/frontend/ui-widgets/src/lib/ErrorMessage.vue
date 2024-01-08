<template>
  <div class="error-message-wrap">
    <transition name="animate-height">
      <div v-if="error" class="error-message">
        <div class="error">
          <Info color="#f46a6a" class="error-icon" />
          <I18nT v-if="interpolationKey" :keypath="interpolationKey" tag="div">
            <slot />
          </I18nT>
          <span v-else v-html="error" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { I18nT } from '@pubstudio/frontend/util-i18n'
import Info from './svg/Info.vue'

withDefaults(
  defineProps<{
    error?: string | null | undefined
    interpolationKey?: string
  }>(),
  {
    error: undefined,
    interpolationKey: undefined,
  },
)
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.error-message-wrap {
  align-items: center;
  width: 100%;

  a {
    text-decoration: underline;
  }

  .error-message {
    @mixin title 14px;
    transition: all 0.3s;
    color: $color-error;
  }

  .error {
    @mixin title-medium 12px;
    @mixin flex-center;
    margin-bottom: 0;
    opacity: 1;
    line-height: 24px;
    color: $color-error;
    justify-content: flex-start;
    max-height: 72px;
    padding: 16px 0 0px;

    .error-icon {
      flex-shrink: 0;
      margin-right: 8px;
    }
    span {
      padding-top: 1px;
    }
  }
}

.animate-height-enter-active,
.animate-height-leave-active {
  max-height: 72px;
  opacity: 1;
}
.animate-height-enter-from,
.animate-height-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
