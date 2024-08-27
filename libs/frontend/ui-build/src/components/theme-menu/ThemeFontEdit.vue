<template>
  <div class="edit-theme-font">
    <!-- Source -->
    <div class="menu-row source-row">
      <div class="label">
        {{ t('source') }}
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
        {{ t('theme.font') }}
        <InfoBubble v-if="isCustomFont" :message="t('theme.font_custom')" class="info" />
      </div>
      <WebSafeFontSelect v-if="isNativeFont" v-model="editingFont.name" class="item" />
      <CustomFontSelect
        v-else-if="isCustomFont"
        v-model:name="editingFont.name"
        v-model:url="editingFont.url"
      />
      <GoogleFontSelect
        v-else
        :modelValue="editingFont.name"
        class="item"
        @update:modelValue="selectGoogleFont"
      />
    </div>
    <!-- Fallback -->
    <div v-if="isGoogleFont" class="menu-row fallback-row">
      <div class="label">
        {{ t('theme.fallback') }}
      </div>
      <WebSafeFontSelect
        v-model="editingFont.fallback"
        class="item"
        :placeholder="t('theme.fallback')"
      />
    </div>
    <div class="preview" :style="{ 'font-family': quotedFont }">
      {{ t('theme.font_preview') }}
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
        @click.stop="resetThemeMenuFonts"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ThemeFontSource } from '@pubstudio/shared/type-site'
import { ErrorMessage, InfoBubble, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useThemeMenuFonts, resetThemeMenuFonts } from '@pubstudio/frontend/feature-build'
import FontSourceSelect from './FontSourceSelect.vue'
import WebSafeFontSelect from './WebSafeFontSelect.vue'
import GoogleFontSelect from './GoogleFontSelect.vue'
import CustomFontSelect from './CustomFontSelect.vue'

const { t } = useI18n()

const { editingFont, selectedGoogleFonts, fontError, saveFont } = useThemeMenuFonts()

const isNativeFont = computed(() => editingFont.source === ThemeFontSource.Native)
const isGoogleFont = computed(() => editingFont.source === ThemeFontSource.Google)
const isCustomFont = computed(() => editingFont.source === ThemeFontSource.Custom)

const quotedFont = computed(() => `"${editingFont.name}"`)

const updateSource = (source: ThemeFontSource) => {
  editingFont.source = source
  editingFont.name = ''
  editingFont.url = undefined
  editingFont.fallback = undefined
}

const selectGoogleFont = async (fontName: string) => {
  editingFont.name = fontName
  selectedGoogleFonts.value.add(fontName)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.label {
  @mixin title-bold 13px;
  display: flex;
  align-items: center;
}
.info {
  margin-left: 6px;
}
.item {
  width: 180px;
}
.preview {
  margin: 16px 0 24px;
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
