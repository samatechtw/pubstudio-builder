<template>
  <div class="emw">
    <div v-if="error" class="em">
      <span v-html="error" />
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    error?: string | null | undefined
  }>(),
  {
    error: undefined,
  },
)
</script>

<style lang="postcss" scoped>
$color-error: #ef4444;

.emw {
  align-items: center;
  width: 100%;
}

.em {
  font-family: Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $color-error;
  max-height: 72px;
}
</style>
