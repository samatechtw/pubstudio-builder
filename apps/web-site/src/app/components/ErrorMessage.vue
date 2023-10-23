<template>
  <div class="error-message-wrap">
    <transition name="animate-height">
      <div v-if="error" class="error-message">
        <div class="error">
          <Info color="#f46a6a" class="error-icon" />
          <span v-html="error" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import Info from './Info.vue'

withDefaults(
  defineProps<{
    error?: string | null | undefined
  }>(),
  {
    error: undefined,
  },
)
</script>

<style lang="postcss">
$color-error: #ef4444;

.error-message-wrap {
  align-items: center;
  width: 100%;

  a {
    text-decoration: underline;
  }

  .error-message {
    font-family: Helvetica, sans-serif;
    font-size: 14px;
    transition: all 0.3s;
    color: $color-error;
  }

  .error {
    font-family: Helvetica, sans-serif;
    font-weight: 500;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
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
