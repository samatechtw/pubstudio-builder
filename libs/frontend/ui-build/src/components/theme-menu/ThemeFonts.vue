<template>
  <div class="theme-fonts">
    <div class="theme-fonts-wrap">
      <div class="fonts-title">
        <div class="label">
          {{ t('theme.fonts') }}
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
            <div v-if="font.fallback" class="font-fallback">
              {{ t(`theme.fallback_to`, { fallback: font.fallback }) }}
            </div>
          </div>
          <Minus class="item-delete" @click="removeFont(font)" />
        </div>
      </div>
      <div v-else class="theme-fonts-empty">
        {{ t('theme.no_fonts') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { Minus, Plus } from '@pubstudio/frontend/ui-widgets'
import { IThemeFont } from '@pubstudio/shared/type-site'
import { useBuild, useThemeMenuFonts } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()

const { fonts, newFont, setEditingFont } = useThemeMenuFonts()
const { deleteThemeFont } = useBuild()

const fontFamily = (name: string) => `"${name}"`

const removeFont = (font: IThemeFont) => {
  deleteThemeFont({
    source: font.source,
    name: font.name,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-fonts {
  @mixin menu;
  padding: 0;
  width: 100%;
  .theme-fonts-wrap {
    width: 100%;
    .fonts-title {
      @mixin flex-row;
      @mixin title 15px;
      align-items: center;
      .label {
        font-weight: bold;
        flex-grow: 1;
      }
    }
    .theme-fonts {
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
    .font-fallback {
      @mixin title-normal 13px;
      color: $grey-500;
      margin: 0 auto 0 16px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & + .theme-fonts-wrap {
      margin-top: 24px;
    }
  }
  .theme-fonts-empty {
    @mixin title-medium 15px;
    padding-top: 16px;
    color: $grey-500;
  }
}
</style>
