<template>
  <div class="theme-menu" @click.stop>
    <ThemeMenuTabs
      v-if="!isEditingVariable && !isEditingFont"
      class="theme-menu-content"
    />
    <ThemeVariableEdit v-else-if="isEditingVariable" class="theme-menu-content" />
    <ThemeFontEdit v-else class="theme-menu-content" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  IThemeVariableEditState,
  useThemeMenuVariables,
} from '../../lib/use-theme-menu-variables'
import { useThemeMenuFonts } from '../../lib/use-theme-menu-fonts'
import ThemeMenuTabs from './ThemeMenuTabs.vue'
import ThemeVariableEdit from './ThemeVariableEdit.vue'
import ThemeFontEdit from './ThemeFontEdit.vue'

const { editState } = useThemeMenuVariables()
const { editing: isEditingFont } = useThemeMenuFonts()

const isEditingVariable = computed(() => editState.value !== IThemeVariableEditState.None)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-menu {
  .theme-menu-content {
    width: 100%;
    padding: 16px;
  }
}
</style>
