<template>
  <div :id="containerId" ref="container" class="prose-mirror-editor-container" />
</template>

<script lang="ts" setup>
import { Plugin } from 'prosemirror-state'
import { computed, onMounted, onBeforeUnmount, ref, toRefs, watch } from 'vue'
import { Css, IComponent, IEditorContext } from '@pubstudio/shared/type-site'
import { getProseMirrorContainerId } from '@pubstudio/frontend/feature-editor'
import { prosemirrorSetup } from '@pubstudio/frontend/util-edit-text'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { isTextGradient } from '@pubstudio/frontend/util-gradient'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { createComponentEditorView } from '../../lib/create-editor-view'
import { useBuild } from '../../lib/use-build'

const props = defineProps<{
  component: IComponent
  editor: IEditorContext
}>()

const { component, editor } = toRefs(props)
const { site } = useBuild()

const container = ref<HTMLDivElement>()
const containerId = computed(() => getProseMirrorContainerId(component.value))

const mountProseMirrorEditor = (
  editor: IEditorContext | undefined,
  container: HTMLElement | null | undefined,
) => {
  const { selectedComponent } = editor ?? {}
  if (editor && container && selectedComponent) {
    const plugins: Plugin[] = []

    // Pass gradient color styles to the inner div of ProseMirror editor.
    plugins.push(
      new Plugin({
        props: {
          attributes: { style: gradientColorStyle.value },
          transformPastedHTML: (html) => {
            const element = document.createElement('div')
            element.innerHTML = html
            return element.textContent ?? ''
          },
        },
      }),
    )

    editor.editView?.destroy()
    editor.editView = createComponentEditorView(
      {
        content: selectedComponent.content || '<div class="pm-p"></div>',
        plugins,
      },
      container,
    )
  }
}

const gradientColorStyle = computed(() => {
  const gradientColorStyles = findStyles(
    [Css.WebkitTextFillColor, Css.WebkitBackgroundClip, Css.Background],
    site.value,
    component.value,
    descSortedBreakpoints.value,
    activeBreakpoint.value,
  )

  const background = resolveThemeVariables(
    site.value.context,
    gradientColorStyles[Css.Background] ?? '',
  )
  const backgroundClip = gradientColorStyles[Css.WebkitBackgroundClip]
  const textFillColor = gradientColorStyles[Css.WebkitTextFillColor]

  const textGradientApplied = isTextGradient(background, backgroundClip, textFillColor)

  if (textGradientApplied) {
    return [
      [Css.Background, background],
      [Css.WebkitBackgroundClip, backgroundClip],
      [Css.WebkitTextFillColor, textFillColor],
    ]
      .map(([prop, value]) => `${prop}:${value}`)
      .join(';')
  } else {
    return ''
  }
})

onMounted(() => {
  mountProseMirrorEditor(editor.value, container.value)
})

// Use watch to re-mount ProseMirror editor so that text gradient styles can be
// applied/removed to/from the component on the fly.
watch(gradientColorStyle, () => {
  mountProseMirrorEditor(editor.value, container.value)
})

onBeforeUnmount(() => {
  editor.value.editView?.destroy()
  editor.value.editView = undefined
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
      const newState = prosemirrorSetup({ content: component.value.content ?? '' })
      editor.value?.editView?.updateState(newState)
    }
  },
)
</script>

<style lang="postcss">
/* Style when ProseMirror editor is not active */
.component-content-container > p + p:empty::before {
  content: '\00a0';
}

.ProseMirror-focused {
  padding: 0 6px;
}

/* Style when ProseMirror editor is active */
.ProseMirror > p {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
