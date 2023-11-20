<template>
  <Modal
    cls="svg-modal"
    :show="!!editSvg"
    :cancelByClickingOutside="false"
    @cancel="clearSvg"
  >
    <div class="svg-content">
      <div class="text-wrap">
        <div class="modal-title">
          {{ t('build.edit_svg') }}
        </div>
        <div class="modal-text">
          {{ t('build.svg_info') }}
        </div>
      </div>
      <div class="preview-wrap">
        <div class="preview">
          <div
            v-if="newSvg.content"
            class="preview"
            :class="{ light: lightPreview }"
            @click="lightPreview = !lightPreview"
            v-html="newSvg.content ?? ''"
          ></div>
          <div v-else class="preview-text">
            {{ t('build.preview') }}
          </div>
        </div>
      </div>
      <div ref="svgCodeEditor" class="code-wrap" />
      <div class="input-actions">
        <PSButton
          v-if="editSvg"
          class="save-button"
          :text="t('save')"
          :secondary="true"
          @click.stop="set"
        />
        <PSButton
          class="cancel-button"
          :text="t('cancel')"
          :secondary="true"
          @click.stop="clearSvg"
        />
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import { EditorView } from 'prosemirror-view'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { setEditSvg } from '@pubstudio/frontend/feature-editor'
import { IEditSvg } from '@pubstudio/shared/type-site'
import { useBuild } from '../../lib/use-build'
import { createCodeEditorView } from '../../lib/create-code-editor-view'

hljs.registerLanguage('xml', xml)

const { t } = useI18n()
const { editor, editComponent } = useBuild()

const newSvg = ref<IEditSvg>({ content: '' })
const lightPreview = ref(false)
let saveStateTimer: ReturnType<typeof setInterval> | undefined

const editSvg = computed(() => {
  return editor.value?.editSvg
})

watch(editSvg, (svg: IEditSvg | undefined) => {
  if (svg) {
    newSvg.value = { ...svg }
  }
})

const startStateTimer = () => {
  if (editSvg.value) {
    saveStateTimer = setInterval(saveState, 1500)
  } else {
    clearTimer()
  }
}

const saveState = () => {
  if (JSON.stringify(editSvg.value) !== JSON.stringify(newSvg.value)) {
    setEditSvg(editor.value, newSvg.value)
  }
}

const updateContent = (value: string) => {
  newSvg.value.content = value
}

const clearTimer = () => {
  if (saveStateTimer) {
    clearInterval(saveStateTimer)
    saveStateTimer = undefined
  }
}

const svgCodeEditor = ref<HTMLDivElement>()

let codeEditorView: EditorView | undefined = undefined

const mountCodeEditor = () => {
  if (svgCodeEditor.value) {
    const codeEditorView = createCodeEditorView('', svgCodeEditor.value, updateContent)
    // ProseMirror will try to parse SVG as nodes, but we want to show the raw text
    codeEditorView?.dispatch(
      codeEditorView?.state.tr.insertText(newSvg.value.content ?? ''),
    )
  }
}

const unmountCodeEditor = () => {
  codeEditorView?.destroy()
  codeEditorView = undefined
}

// onMounted() and onUnmounted() isn't suitable here because they only work when the modal is
// mounted/unmounted, so we use `watch` to mount/unmount ProseMirror editor when target div
// is mounted/unmounted.
watch(svgCodeEditor, (domElement) => {
  if (domElement) {
    mountCodeEditor()
  } else {
    unmountCodeEditor()
  }
})

const set = () => {
  editComponent({ content: newSvg.value.content })
  clearSvg()
}

const clearSvg = () => {
  clearTimer()
  setEditSvg(editor.value, undefined)
}

onMounted(() => {
  startStateTimer()
  newSvg.value = { ...(newSvg.value ?? { content: '' }) }
})

onUnmounted(() => {
  unmountCodeEditor()
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.svg-modal {
  .input-actions {
    @mixin menu-actions;
    justify-content: flex-start;
    > button {
      max-width: 120px;
      &:not(:first-child) {
        margin-left: 8px;
      }
    }
  }
  .svg-content {
    display: flex;
    flex-wrap: wrap;
  }
  .text-wrap {
    @mixin flex-col;
    width: 50%;
  }
  .preview-wrap {
    display: flex;
    align-items: flex-end;
    padding-left: 24px;
  }
  .preview {
    @mixin flex-center;
    background-color: black;
    width: 80px;
    height: 80px;
    cursor: pointer;
    transition: background-color 0.2s;
    &.light {
      background-color: white;
    }
    > svg {
      width: 100%;
      height: 100%;
    }
  }
  .preview-text {
    @mixin title-thin 16px;
    color: rgba(255, 255, 255, 0.6);
  }
  .modal-text {
    font-size: 15px;
  }
  .modal-inner {
    width: 640px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  .code-wrap {
    width: 100%;
    max-height: 250px;
    overflow: auto;
    margin-top: 16px;
    .ProseMirror {
      .hljs {
        margin: 0;
        min-height: 250px;
        padding: 8px;
      }
    }
  }
}
</style>
