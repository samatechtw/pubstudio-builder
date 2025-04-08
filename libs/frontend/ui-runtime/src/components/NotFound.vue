<template>
  <div class="nf">
    <div class="nf1">
      {{ notFoundTitle }}
    </div>
    <div class="nf2">
      {{ notFoundText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const notFoundTitle = 'Not Found'
const notFoundText = "Sorry, we can't find what you're looking for."
</script>

<style lang="postcss">
.nf {
  color: #070028;
  min-height: 480px;
  text-align: center;
  padding-top: 120px;
  position: relative;
  font-family: Helvetica, sans-serif;
}
.nf1 {
  font-size: 24px;
  font-weight: 600;
}
.nf2 {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 24px;
}
</style>
