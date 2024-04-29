<template>
  <div class="ps-toggle" :class="{ on, small }" @click="emit('toggle', !on)">
    <div class="indicator"></div>
    <div class="text on">
      {{ onText ?? t('on') }}
    </div>
    <div class="text off">
      {{ offText ?? t('off') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()

withDefaults(
  defineProps<{
    on: boolean
    onText?: string
    offText?: string
    small?: boolean
  }>(),
  {
    onText: undefined,
    offText: undefined,
  },
)

const emit = defineEmits<{
  (e: 'toggle', on: boolean): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-toggle {
  @mixin flex-row;
  @mixin title 14px;
  position: relative;
  width: 72px;
  height: 36px;
  border-radius: 22px;
  background-color: $grey-300;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0 6px;
  user-select: none;
  .indicator {
    @mixin size 28px;
    position: absolute;
    border-radius: 50%;
    background-color: white;
    left: 4px;
    top: 4px;
    transition: left 0.2s ease;
    z-index: 2;
  }
  .on {
    opacity: 0;
  }
  .text {
    position: relative;
    @mixin flex-center;
    color: black;
    width: 50%;
    transition: opacity 0.2s ease;
    z-index: 1;
  }
  &.on {
    background-color: $green-500;
    .indicator {
      left: 38px;
    }
    .off {
      opacity: 0;
    }
    .on {
      opacity: 1;
    }
  }
  &.small {
    width: 68px;
    height: 30px;
    border-radius: 18px;
    padding: 0 8px;
    font-size: 12px;
    .indicator {
      @mixin size 22px;
      left: 4px;
    }
    &.on {
      .indicator {
        left: 42px;
      }
    }
  }
}
</style>
