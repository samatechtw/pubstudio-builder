<template>
  <BuilderEdit :componentId="componentId" @click="editSvg" />
</template>

<script lang="ts" setup>
import { setEditSvg } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import BuilderEdit from './BuilderEdit.vue'

const { editor } = useSiteSource()

defineProps<{
  componentId: string
}>()

const editSvg = () => {
  if (editor.value && editor.value.selectedComponent) {
    setEditSvg(editor.value, { content: editor.value.selectedComponent.content ?? '' })
  }
}
</script>
