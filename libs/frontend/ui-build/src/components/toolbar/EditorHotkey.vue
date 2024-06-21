<template>
  <div class="hotkey-wrap" @click="setEditing">
    <div class="action">
      {{ t(`actions.${state}.${action}`) }}
    </div>
    <div v-if="isEditing" class="hotkey-edit">
      {{ t('type') }}
    </div>
    <div v-else class="hotkey">
      {{ hotkey }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { HotkeyStates } from '@pubstudio/shared/type-site'
import { useEditHotkey } from '@pubstudio/frontend/feature-build'

const props = defineProps<{
  state: HotkeyStates
  defaultHotkey: string
  action: string
}>()
const { defaultHotkey, state, action } = toRefs(props)

const { invertedEditorHotkeys, isEditing, setEditing } = useEditHotkey({
  state: state.value,
  action: action.value,
})

const hotkey = computed(() => {
  const states = invertedEditorHotkeys.value?.[state.value]
  return states?.[action.value] ?? defaultHotkey.value
})

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.hotkey-wrap {
  display: flex;
  justify-content: space-between;
  padding: 2px 8px 2px 1px;
  transition: background-color 0.1s ease;
  cursor: pointer;
  &:hover {
    background-color: $grey-100;
  }
}

.hotkey-edit {
  color: $grey-500;
}
</style>
