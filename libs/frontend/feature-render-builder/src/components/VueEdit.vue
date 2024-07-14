<template>
  <BuilderEdit :componentId="componentId" @click="editVue" />
</template>

<script lang="ts" setup>
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import BuilderEdit from './BuilderEdit.vue'

const { editor } = useSiteSource()

defineProps<{
  componentId: string
}>()

const editVue = () => {
  if (editor.value && editor.value.selectedComponent) {
    // TODO
  }
}
</script>
