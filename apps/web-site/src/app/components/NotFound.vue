<template>
  <div class="not-found content-wrap">
    <div class="not-found-title content-title">
      {{ notFoundTitle }}
    </div>
    <div class="not-found-text">
      {{ notFoundText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const notFoundTitle = 'Not Found'
const notFoundText = "Sorry, we can't find what you're looking for."
</script>

<style lang="postcss">
.not-found {
  color: #070028;
  min-height: 480px;
  text-align: center;
  padding-top: 120px;
  position: relative;
}
.not-found-text {
  font-size: 16px;
  font-weight: 500;
  font-family: Helvetica, sans-serif;
  color: rgba(black, 0.6);
  margin-top: 24px;
}
</style>
