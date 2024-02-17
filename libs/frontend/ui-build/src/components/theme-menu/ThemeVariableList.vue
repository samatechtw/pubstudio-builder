<template>
  <div v-if="variables.length" class="theme-variables">
    <div
      v-for="variable in variables"
      :key="variable.key"
      class="variable-entry edit-item"
    >
      <div class="variable-preview" @click="setEditingThemeVariable(variable, state)">
        <div class="variable-name">
          {{ variable.key }}
        </div>
        <div class="variable-value">
          {{ variable.value }}
        </div>
        <template v-if="variable.isColor">
          <Checkbox
            class="select-color-checkbox"
            :item="{ label: '', checked: editor?.selectedThemeColors?.has(variable.key) }"
            @checked="toggleSelectedColor(variable.key)"
            @click.stop
          />
          <div class="variable-color-wrap">
            <div
              class="variable-color"
              :style="{ 'background-color': variable.resolved ?? variable.value }"
            />
          </div>
        </template>
      </div>
      <Minus
        v-if="state === IThemeVariableEditState.Custom"
        class="item-delete"
        @click="removeThemeVariable(variable)"
      />
    </div>
  </div>
  <div v-else class="theme-variables-empty">
    {{ emptyText }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  IThemeVariableEditState,
  useBuild,
  useThemeMenuVariables,
} from '@pubstudio/frontend/feature-build'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { selectColor, unselectColor } from '@pubstudio/frontend/util-command'
import { Checkbox, Minus } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()
const { editor, deleteThemeVariable } = useBuild()
const { setEditingThemeVariable } = useThemeMenuVariables()

const props = defineProps<{
  variables: IThemeVariable[]
  state: IThemeVariableEditState
}>()
const { state } = toRefs(props)

const emptyText = computed(() => {
  return state.value === IThemeVariableEditState.Custom
    ? t('theme.no_custom')
    : t('theme.no_builtin')
})

const toggleSelectedColor = (id: string) => {
  if (editor.value?.selectedThemeColors?.has(id)) {
    unselectColor(editor.value, id)
  } else {
    selectColor(editor.value, id)
  }
}

const removeThemeVariable = (themeVariable: IThemeVariable) => {
  deleteThemeVariable({
    key: themeVariable.key,
    value: themeVariable.value,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-variables {
  position: relative;
  margin-top: 4px;
}

.variable-entry {
  @mixin text 14px;
  padding: 6px 0;
  justify-content: space-between;
  border-bottom: 1px solid $grey-100;
  cursor: default;
}
.variable-preview {
  @mixin flex-row;
  flex-grow: 1;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  align-items: center;
}
.variable-value {
  color: $grey-500;
  margin: 0 auto 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.select-color-checkbox {
  margin: 0;
  :deep(.checkmark) {
    margin: 0;
  }
}
.variable-color-wrap {
  padding: 0 4px 0 8px;
}
.variable-color {
  @mixin size 14px;
  border: 1px solid #313233;
}
.item-delete {
  margin-left: 2px;
}
</style>
