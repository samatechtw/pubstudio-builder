<template>
  <Modal
    cls="bm"
    :show="!!behavior"
    :cancelByClickingOutside="false"
    escapeEvent="keyup"
    @cancel="clearBehavior"
  >
    <div>
      <div class="modal-title">
        {{ behavior?.id ? t('build.edit_behavior') : t('build.new_behavior') }}
      </div>

      <div class="modal-text">
        <div>
          {{ t('build.behavior_info') }}
        </div>
        <div class="context-wrap">
          <div class="context">
            <BehaviorContextVars />
            <MenuRow
              :label="t('name')"
              :value="newBehavior.name"
              :forceEdit="true"
              :focusInput="false"
              :immediateUpdate="true"
              @update="newBehavior.name = $event || ''"
            />
          </div>
          <BehaviorArgs
            :behavior="newBehavior"
            @setArg="setEditingArg"
            @saveArg="saveArg"
          />
        </div>
      </div>
      <div ref="behaviorCodeEditor" class="code-wrap" />
      <div class="input-actions">
        <PSButton
          v-if="behavior"
          class="save-button"
          :text="t('save')"
          :secondary="true"
          @click.stop="saveBehavior"
        />
        <PSButton
          v-if="behavior?.id"
          class="delete-button"
          :text="t('delete')"
          :secondary="true"
          @click.stop="remove(behavior.id)"
        />
        <PSButton
          class="cancel-button"
          :text="t('cancel')"
          :secondary="true"
          @click.stop="clearBehavior"
        />
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import js from 'highlight.js/lib/languages/javascript'
import { EditorView } from 'prosemirror-view'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { setOrCreate } from '@pubstudio/shared/type-utils'
import { nextBehaviorId } from '@pubstudio/frontend/util-ids'
import { IBehavior, IBehaviorArg, IEditBehavior } from '@pubstudio/shared/type-site'
import MenuRow from '../MenuRow.vue'
import BehaviorArgs from './BehaviorArgs.vue'
import { useBuild, createCodeEditorView } from '@pubstudio/frontend/feature-build'
import { setEditBehavior } from '@pubstudio/frontend/data-access-command'
import BehaviorContextVars from './BehaviorContextVars.vue'

hljs.registerLanguage('javascript', js)

const { t } = useI18n()
const { site, editor, setBehavior, removeBehavior, setBehaviorArg } = useBuild()

const newBehavior = ref<IEditBehavior>({ name: '', code: '' })
let saveStateTimer: ReturnType<typeof setInterval> | undefined

const emit = defineEmits<{
  (e: 'saved', behavior: IBehavior): void
}>()

const behavior = computed(() => {
  return editor.value?.editBehavior
})

watch(behavior, (behavior: IEditBehavior | undefined) => {
  if (behavior) {
    newBehavior.value = { ...behavior }
  }
})

const startStateTimer = () => {
  if (behavior.value) {
    saveStateTimer = setInterval(saveState, 1500)
  } else {
    clearTimer()
  }
}

const saveState = () => {
  if (JSON.stringify(behavior.value) !== JSON.stringify(newBehavior.value)) {
    setEditBehavior(editor.value, newBehavior.value)
  }
}

const updateCode = (value: string) => {
  newBehavior.value.code = value
}

const saveArg = (oldArg: IBehaviorArg | undefined, newArg: IBehaviorArg | undefined) => {
  setEditingArg(oldArg, newArg)
  if (newBehavior.value.id) {
    setBehaviorArg(newBehavior.value.id, oldArg, newArg)
  }
}

const setEditingArg = (
  oldArg: IBehaviorArg | undefined,
  newArg: IBehaviorArg | undefined,
) => {
  if (!oldArg && newArg) {
    // Add arg
    newBehavior.value.args = setOrCreate(newBehavior.value.args, newArg.name, newArg)
  } else if (oldArg && !newArg) {
    // Remove arg
    newBehavior.value.args = setOrCreate(newBehavior.value.args, oldArg.name, undefined)
  } else if (oldArg && newArg) {
    // Update arg
    newBehavior.value.args = setOrCreate(newBehavior.value.args, oldArg.name, undefined)
    newBehavior.value.args = setOrCreate(newBehavior.value.args, newArg.name, newArg)
  }
}

const clearTimer = () => {
  if (saveStateTimer) {
    clearInterval(saveStateTimer)
    saveStateTimer = undefined
  }
}

const behaviorCodeEditor = ref<HTMLDivElement>()

let codeEditorView: EditorView | undefined = undefined

const mountCodeEditor = () => {
  if (behaviorCodeEditor.value) {
    codeEditorView = createCodeEditorView(
      newBehavior.value.code ?? '',
      behaviorCodeEditor.value,
      updateCode,
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
watch(behaviorCodeEditor, (domElement) => {
  if (domElement) {
    mountCodeEditor()
  } else {
    unmountCodeEditor()
  }
})

const saveBehavior = () => {
  const behavior = {
    id: newBehavior.value.id ?? nextBehaviorId(site.value.context),
    name: newBehavior.value.name,
    code: newBehavior.value.code,
    args: newBehavior.value.args,
  }
  setBehavior(behavior)
  emit('saved', behavior)
  clearBehavior()
}

const remove = (behaviorId: string) => {
  removeBehavior(behaviorId)
  clearBehavior()
}

const clearBehavior = () => {
  clearTimer()
  setEditBehavior(editor.value, undefined)
}

onMounted(() => {
  startStateTimer()
  newBehavior.value = { ...(behavior.value ?? { name: '' }) }
})

onUnmounted(() => {
  unmountCodeEditor()
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.bm {
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
  .modal-text {
    font-size: 15px;
  }
  .modal-inner {
    width: 640px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  .menu-row {
    justify-content: flex-start;
    .item {
      margin-left: 32px;
    }
  }
  .context-wrap {
    @mixin flex-row;
    width: 100%;
  }
  .context {
    @mixin flex-col;
    padding-right: 24px;
  }
}
.message.behavior-helpers {
  max-width: 600px;
  .bh-title {
    @mixin title 13px;
    margin-bottom: 8px;
  }
  .helper {
    margin-top: 6px;
  }
  .helper-title {
    font-weight: 500;
  }
}
</style>
