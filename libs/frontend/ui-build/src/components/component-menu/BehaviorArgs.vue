<template>
  <div class="behavior-args">
    <div class="behavior-args-title">
      <div>
        {{ t('build.args') }}
      </div>
      <Plus v-if="!editArg" class="add-icon" @click="addArg" />
      <InfoBubble :message="t('behavior_context.args')" placement="right" />
    </div>
    <div v-if="editArg" class="edit-arg-wrap">
      <div class="edit-arg">
        <STInput v-model="editArg.name" class="name" :placeholder="t('name')" />
        <STMultiselect
          :value="editArg.type"
          :placeholder="t('type')"
          :options="Object.values(ComponentArgPrimitive)"
          @select="selectType"
        />
        <STInput
          v-model="editArg.default as string"
          class="default"
          :placeholder="t('default')"
        />
        <div class="args-actions">
          <Check class="save" color="#009879" @click="saveArg" />
          <Cross class="cancel" @click="cancel" />
        </div>
      </div>
      <STInput v-model="editArg.help" class="edit-help" :placeholder="t('help')" />
    </div>
    <div
      v-for="(arg, index) in Object.values(behavior?.args || {})"
      v-else
      :key="index"
      class="arg"
    >
      <div class="arg-name">
        {{ arg.name }}
      </div>
      <div class="arg-type">
        {{ arg.type }}
      </div>
      <InfoBubble :message="arg.help || t('behavior_context.no_help')" class="arg-help" />
      <Edit class="edit-icon" @click="edit(arg)" />
      <Minus class="remove-icon" @click="removeArg(arg)" />
    </div>
    <ErrorMessage :error="error" />
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { STMultiselect } from '@samatech/vue-components'
import {
  ComponentArgPrimitive,
  ComponentArgType,
  IBehaviorArg,
  IEditBehavior,
} from '@pubstudio/shared/type-site'
import {
  Check,
  InfoBubble,
  Minus,
  Plus,
  Edit,
  ErrorMessage,
  Cross,
} from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()
const editArg = ref<IBehaviorArg | undefined>()
const oldArg = ref<IBehaviorArg | undefined>()
const error = ref()

const props = defineProps<{
  behavior: IEditBehavior | undefined
}>()
const { behavior } = toRefs(props)

const emit = defineEmits<{
  // Set the edited arg without persisting to the site
  (e: 'setArg', oldArg: IBehaviorArg | undefined, newArg: IBehaviorArg | undefined): void
  // Persist the edited arg to the site
  (e: 'saveArg', oldArg: IBehaviorArg | undefined, newArg: IBehaviorArg | undefined): void
}>()

const selectType = (argType: ComponentArgType | undefined) => {
  if (editArg.value && argType) {
    editArg.value.type = argType
  }
}

const saveArg = () => {
  const arg = editArg.value
  if (arg) {
    const nameInUse = !!behavior.value?.args?.[arg.name]
    if (
      // Name must be at least 1 character
      !arg.name ||
      // New arg cannot have same name as existing arg
      (!oldArg.value && nameInUse) ||
      // Updated arg cannot have same name as other arg
      (oldArg.value && oldArg.value.name !== arg.name && nameInUse)
    ) {
      error.value = t('errors.arg_name')
      return
    }
    emit('saveArg', oldArg.value, editArg.value)
  }
  cancel()
}

const edit = (arg: IBehaviorArg) => {
  editArg.value = { ...arg }
  oldArg.value = { ...arg }
}

const cancel = () => {
  editArg.value = undefined
  oldArg.value = undefined
  error.value = undefined
}

const removeArg = (arg: IBehaviorArg) => {
  emit('setArg', arg, undefined)
  emit('saveArg', arg, undefined)
}

const addArg = () => {
  if (editArg.value) {
    emit('setArg', oldArg.value, editArg.value)
  }

  oldArg.value = undefined
  editArg.value = {
    name: '',
    type: ComponentArgPrimitive.String,
    default: '',
    help: '',
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.behavior-args {
  flex-grow: 1;
  padding-bottom: 12px;
}
.behavior-args-title {
  @mixin flex-row;
  align-items: center;
  margin-bottom: 8px;
  > div:first-child {
    margin-right: 6px;
  }
}
.add-icon,
.edit-icon,
.remove-icon {
  @mixin size 22px;
  cursor: pointer;
  flex-shrink: 0;
}
.edit-icon {
  @mixin size 23px;
  margin-left: 6px;
}
.add-icon {
  margin-right: 8px;
}
.remove-icon {
  @mixin size 20px;
  margin-left: 6px;
}

:deep(.st-input) {
  height: 36px;
}
.edit-arg {
  @mixin flex-row;
  align-items: center;
  :deep(.st-multiselect) {
    height: 36px;
    width: 120px;
  }
}
.cancel {
  cursor: pointer;
  margin-left: 6px;
}
.args-actions {
  display: flex;
  align-items: center;
}
.edit-help {
  height: 36px;
  margin-top: 4px;
}
.arg {
  @mixin flex-row;
  align-items: center;
  height: 36px;
  width: 100%;
}
.arg-name {
  width: 40%;
}
.arg-type {
  width: 90px;
  color: $green-700;
}
.arg-help {
  margin-left: auto;
}
.name {
  margin-right: 6px;
}
.default {
  margin-left: 6px;
  width: 100px;
}
.save {
  @mixin size 24px;
  cursor: pointer;
  margin-left: 4px;
}
</style>
