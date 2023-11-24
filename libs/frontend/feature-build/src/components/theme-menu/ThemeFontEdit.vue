<template>
  <div class="edit-theme-font">
    <!-- Source -->
    <div class="menu-row source-row">
      <div class="label">
        {{ t('theme.font_source') }}
      </div>
      <FontSourceSelect
        class="item"
        :modelValue="editingFont.source"
        @update:modelValue="updateSource"
      />
    </div>
    <!-- Name -->
    <div class="menu-row name-row">
      <div class="label">
        {{ t('theme.font_name') }}
      </div>
      <WebSafeFontSelect v-if="isNativeFont" v-model="editingFont.name" class="item" />
      <GoogleFontSelect v-else v-model="editingFont.name" class="item" />
    </div>
    <!-- Fallback -->
    <div v-if="!isNativeFont" class="menu-row fallback-row">
      <div class="label">
        {{ t('theme.fallback') }}
      </div>
      <WebSafeFontSelect
        v-model="editingFont.fallback"
        class="item"
        :placeholder="t('theme.fallback')"
      />
    </div>
    <ErrorMessage :error="fontError" />
    <div class="theme-font-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        background="#451dd6"
        @click.stop="saveFont"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="clearEditingState"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { ThemeFontSource } from '@pubstudio/shared/type-site'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useThemeMenuFonts } from '../../lib/use-theme-menu-fonts'
import FontSourceSelect from './FontSourceSelect.vue'
import WebSafeFontSelect from './WebSafeFontSelect.vue'
import GoogleFontSelect from './GoogleFontSelect.vue'
import { computed } from 'vue'

const { t } = useI18n()

const { editingFont, fontError, clearEditingState, saveFont } = useThemeMenuFonts()

const isNativeFont = computed(() => editingFont.source === ThemeFontSource.Native)

const updateSource = (source: ThemeFontSource) => {
  editingFont.source = source
  editingFont.name = ''
  editingFont.fallback = undefined
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.label {
  @mixin title-bold 13px;
}
.item {
  width: 180px;
}
.theme-font-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  > button {
    width: 48%;
  }
}
</style>
