<template>
  <Teleport to="body">
    <div class="ps-toast-wrap">
      <TransitionGroup name="toast">
        <div
          v-for="(toast, index) in toasts"
          :key="index"
          class="ps-toast"
          :class="toast.type"
        >
          <div class="toast-left">
            {{ toast.text }}
          </div>
          <div class="toast-right" @click="removeToast(index)">
            <img :src="IcX" />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import IcX from '@frontend-assets/icon/x.svg'
import { useToast } from './use-toast'

const { toasts, removeToast } = useToast()
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.ps-toast-wrap {
  @mixin flex-col;
  align-items: center;
  margin-top: 60px;
  position: absolute;
  top: 0;
  width: 100%;
  .toast-left {
    @mixin title 15px;
    color: $color-primary;
  }
  .ps-toast {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    min-width: 240px;
    min-height: 58px;
    box-shadow: 0 16px 40px rgba(#000, 0.25);
    border-radius: 29px;
    margin-top: 16px;
    z-index: $z-index-toast;
    background-color: white;
    &.error {
      .toast-left {
        color: $color-error;
      }
    }
  }
  .toast-right {
    margin-left: 6px;
    padding: 6px;
    cursor: pointer;
    img {
      width: 12px;
      height: 12px;
    }
  }
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-active {
  position: absolute;
}
</style>
