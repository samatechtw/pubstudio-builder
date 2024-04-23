<template>
  <div class="edit-global-style">
    <MenuRowEdit
      :modelValue="editGlobalStyle?.newName ?? ''"
      :label="t('name')"
      class="name"
      @update:modelValue="setEditGlobalStyle(site.editor, { newName: $event })"
    />
    <div class="menu-row style-wrap">
      <div ref="globalStyleEditor" class="code-wrap" />
      <div v-if="!editGlobalStyle?.style" class="global-placeholder">
        {{ t('style.global_placeholder') }}
      </div>
    </div>
    <ErrorMessage :error="globalStyleError" />
    <div class="global-style-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        background="#451dd6"
        @click.stop="saveGlobalStyle"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="resetEditGlobalStyles"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { EditorView } from 'prosemirror-view'
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { createCodeEditorView, useGlobalStyles } from '@pubstudio/frontend/feature-build'
import MenuRowEdit from '../MenuRowEdit.vue'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { setEditGlobalStyle } from '@pubstudio/frontend/data-access-command'

hljs.registerLanguage('css', css)

const { t } = useI18n()

const { site } = useSiteSource()
const { resetEditGlobalStyles, editGlobalStyle, globalStyleError, saveGlobalStyle } =
  useGlobalStyles()

const globalStyleEditor = ref<HTMLDivElement>()
let codeEditorView: EditorView | undefined = undefined

const mountCodeEditor = () => {
  if (globalStyleEditor.value) {
    codeEditorView = createCodeEditorView(
      editGlobalStyle.value?.style ?? '',
      globalStyleEditor.value,
      (code: string) => {
        setEditGlobalStyle(site.value.editor, { style: code })
      },
    )
  }
}

const unmountCodeEditor = () => {
  codeEditorView?.destroy()
  codeEditorView = undefined
}

onMounted(() => {
  mountCodeEditor()
})

onUnmounted(() => {
  unmountCodeEditor()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.label {
  @mixin title-bold 13px;
}
.style-wrap {
  position: relative;
}
.global-placeholder {
  @mixin title 14px;
  position: absolute;
  width: 100%;
  top: 18px;
  padding: 12px 8px;
  color: $grey-300;
  pointer-events: none;
}
.global-style-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  > button {
    width: 48%;
  }
}
</style>
