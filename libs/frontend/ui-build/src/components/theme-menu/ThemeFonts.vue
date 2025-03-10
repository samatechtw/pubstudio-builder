<template>
  <div class="theme-fonts-wrap">
    <div class="fonts-title">
      <div class="label">
        {{ t('fonts') }}
      </div>
      <div class="item new-font-button" @click.stop="newFont">
        <Plus class="item-add" />
      </div>
    </div>
    <div v-if="fonts.length" class="theme-fonts">
      <div v-for="font in fonts" :key="font.name" class="font-entry edit-item">
        <div class="font-preview" @click="setEditingFont(font)">
          <div :style="{ 'font-family': fontFamily(font.name) }" class="font-name">
            {{ font.name }}
          </div>
          <div class="font-source">
            {{ t(`theme.${font.source}`) }}
          </div>
        </div>
        <Minus class="item-delete" @click="removeFont(font)" />
      </div>
    </div>
    <div v-else class="theme-fonts-empty">
      {{ t('theme.no_fonts') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { Minus, Plus } from '@pubstudio/frontend/ui-widgets'
import { IThemeFont } from '@pubstudio/shared/type-site'
import { deleteThemeFont, useThemeMenuFonts } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()

const { fonts, newFont, setEditingFont } = useThemeMenuFonts()
const { site } = useSiteSource()

const fontFamily = (name: string) => `"${name}"`

const removeFont = (font: IThemeFont) => {
  deleteThemeFont(site.value, {
    source: font.source,
    name: font.name,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-fonts-wrap {
  @mixin menu;
  align-items: flex-start;
  padding: 0;
  width: 100%;
}
.fonts-title {
  @mixin flex-row;
  @mixin title 15px;
  width: 100%;
  align-items: center;
  .label {
    font-weight: bold;
    flex-grow: 1;
  }
}
.theme-fonts {
  width: 100%;
  margin-top: 4px;
}
.font-entry {
  font-size: 15px;
  width: 100%;
  padding: 12px 0;
  justify-content: space-between;
  border-bottom: 1px solid $grey-100;
  cursor: default;
}
.font-preview {
  @mixin flex-row;
  flex-grow: 1;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  align-items: center;
}
.font-source {
  @mixin title-normal 13px;
  color: $grey-500;
  margin-left: 16px;
}
.item-delete {
  margin-left: auto;
}
.theme-fonts-empty {
  @mixin title-medium 15px;
  padding-top: 16px;
  color: $grey-500;
}
</style>
