<template>
  <Teleport to="body">
    <div class="ps-hud-wrap">
      <TransitionGroup name="hud">
        <div v-for="hud in huds" :key="hud.id" class="ps-hud">
          {{ hud.text }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { useHUD } from '@pubstudio/frontend/util-ui-alert'

const { huds } = useHUD()
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';
@import '@theme/css/typography.postcss';
@import '@theme/css/colors.postcss';

.ps-hud-wrap {
  @mixin flex-col;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  pointer-events: none;
  .ps-hud {
    @mixin text 20px;
    position: absolute;
    padding: 24px;
    border-radius: 8px;
    color: white;
    background-color: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(12px);
    z-index: 1000;
  }
}

.hud-leave-active {
  transition: opacity 0.25s ease;
  opacity: 1;
}
.hud-leave-to {
  opacity: 0;
}
</style>
