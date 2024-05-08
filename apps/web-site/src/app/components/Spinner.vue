<template>
  <div ref="wrapper" class="spinner-wrap">
    <span class="dot" />
    <span class="dot" />
    <span class="dot" />
  </div>
</template>

<style lang="postcss" scoped>
.spinner-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2a17d6;
  animation: scale 0.6s ease alternate infinite;
  &:not(:first-child) {
    margin-left: calc(32px / 4);
  }
  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
}
@keyframes scale {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
