<template>
  <Modal
    cls="bm"
    :show="!!behavior"
    :cancelByClickingOutside="false"
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
      <textarea
        :value="newBehavior.code || ''"
        class="code"
        :placeholder="t('build.behavior_code')"
        rows="15"
        @input="updateCode"
      />
      <div class="input-actions">
        <PSButton
          v-if="behavior"
          class="save-button"
          :text="t('save')"
          :secondary="true"
          @click.stop="set"
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
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { setOrCreate } from '@pubstudio/shared/type-utils'
import { nextBehaviorId } from '@pubstudio/frontend/util-ids'
import { setEditBehavior } from '@pubstudio/frontend/feature-editor'
import { IBehaviorArg, IEditBehavior } from '@pubstudio/shared/type-site'
import MenuRow from '../MenuRow.vue'
import BehaviorArgs from './BehaviorArgs.vue'
import { useBuild } from '../../lib/use-build'
import BehaviorContextVars from './BehaviorContextVars.vue'

const { t } = useI18n()
const { site, editor, setBehavior, removeBehavior, setBehaviorArg } = useBuild()

const newBehavior = ref<IEditBehavior>({ name: '', code: '' })
let saveStateTimer: ReturnType<typeof setInterval> | undefined

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

const updateCode = (event: Event) => {
  newBehavior.value.code = (event.target as HTMLInputElement)?.value
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

const set = () => {
  const behavior = newBehavior.value
  setBehavior({
    id: behavior.id ?? nextBehaviorId(site.value.context),
    name: behavior.name,
    code: behavior.code,
    args: behavior.args,
  })
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
  .code {
    width: 100%;
    white-space: nowrap;
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
