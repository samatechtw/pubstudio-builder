<template>
  <Teleport to="body">
    <div class="ps-toast wrap">
      <TransitionGroup name="toast">
        <div
          v-for="(toast, index) in toasts"
          :key="index"
          class="toast"
          :class="toast.type"
        >
          <div class="left">
            {{ toast.text }}
          </div>
          <div class="right" @click="removeToast(index)">
            <img :src="IcX" />
          </div>
        </div>
      </TransitionGroup>
    </div>
    <div class="ps-hud wrap">
      <TransitionGroup name="hud">
        <div v-for="hud in huds" :key="hud.id" class="hud">
          {{ hud.text }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { useToast } from '@pubstudio/frontend/util-ui-alert'
import IcX from '@frontend-assets/icon/x.svg'

const { toasts, huds, removeToast } = useToast()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.wrap {
  @mixin flex-col;
  align-items: center;
  top: 0;
  width: 100%;
}

.ps-hud {
  justify-content: center;
  height: 100%;
  position: fixed;
  pointer-events: none;
}
.hud {
  @mixin text 20px;
  position: absolute;
  padding: 24px;
  border-radius: 8px;
  color: white;
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  z-index: $z-index-toast;
}

.hud-leave-active {
  transition: opacity 0.25s ease;
  opacity: 1;
}
.hud-leave-to {
  opacity: 0;
}

.ps-toast {
  margin-top: 60px;
  position: absolute;
}
.left {
  @mixin title 15px;
  color: $color-primary;
}
.toast {
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
    .left {
      color: $color-error;
    }
  }
}
.right {
  margin-left: 6px;
  padding: 6px;
  cursor: pointer;
  img {
    width: 12px;
    height: 12px;
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
