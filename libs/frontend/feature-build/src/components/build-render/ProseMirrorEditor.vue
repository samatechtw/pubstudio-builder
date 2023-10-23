<template>
  <div ref="container" :id="containerId" class="prose-mirror-editor-container" />
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref, toRefs, watch } from 'vue'
import { IComponent, IEditorContext } from '@pubstudio/shared/type-site'
import { getProseMirrorContainerId } from '@pubstudio/frontend/feature-editor'
import { prosemirrorSetup } from '@pubstudio/frontend/util-edit-text'
import { createEditorView } from '../../lib/create-editor-view'

const props = defineProps<{
  component: IComponent
  editor: IEditorContext
}>()

const { component, editor } = toRefs(props)

const container = ref<HTMLDivElement>()
const containerId = computed(() => getProseMirrorContainerId(component.value))

const mountProseMirrorEditor = (
  editor: IEditorContext | undefined,
  container: HTMLElement | null | undefined,
) => {
  const { selectedComponent } = editor ?? {}
  if (editor && container && selectedComponent) {
    editor.editView?.destroy()
    editor.editView = createEditorView(
      {
        component: selectedComponent,
      },
      container,
    )
  }
}

const mountEditor = () => {
  mountProseMirrorEditor(editor.value, container.value)
}

onMounted(() => {
  mountEditor()
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.editView?.destroy()
    editor.value.editView = undefined
  }
})

watch(
  () => editor.value?.selectedComponent?.content,
  () => {
    // This is to update ProseMirror editor state when the editor is active (which
    // means this Vue component is alive), and the corresponding component content
    // is being updated from somewhere else (e.g. redo/undo/component-menu).
    // We should only update ProseMirror editor state when the editor is not focused
    // because `updateState()` will cause the editor to lose its' focus and selection.
    const proseMirrorFocused = document.activeElement?.classList.contains('ProseMirror')
    if (!proseMirrorFocused) {
      const newState = prosemirrorSetup({ component: component.value })
      editor.value?.editView?.updateState(newState)
    }
  },
)
</script>

<style lang="postcss">
.component-content-container > p,
.ProseMirror > p {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
