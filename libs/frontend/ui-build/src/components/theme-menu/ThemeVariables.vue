<template>
  <div class="theme-variables-list">
    <!-- Custom -->
    <div class="theme-variables-wrap">
      <div class="custom-title">
        <div class="label">
          {{ t('theme.custom') }}
        </div>
        <InfoBubble
          v-if="themeVariables.custom.length"
          :message="t('build.select_color_info')"
          :showArrow="false"
          placement="top"
          class="custom-info-bubble"
        />
        <div class="item new-theme-variable-button" @click.stop="newThemeVariable">
          <Plus class="item-add" />
        </div>
      </div>
      <ThemeVariableList
        :variables="themeVariables.custom"
        :state="IThemeVariableEditState.Custom"
      />
    </div>
    <!-- Builtin -->
    <div class="theme-variables-wrap">
      <div class="builtin-title">
        <div class="label">
          {{ t('theme.builtin') }}
        </div>
        <InfoBubble
          :message="t('build.select_color_info')"
          :showArrow="false"
          placement="top"
          class="builtin-info-bubble"
        />
      </div>
      <ThemeVariableList
        :variables="themeVariables.builtin"
        :state="IThemeVariableEditState.Builtin"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble, Plus } from '@pubstudio/frontend/ui-widgets'
import {
  IThemeVariableEditState,
  IThemeVariables,
  useThemeMenuVariables,
} from '@pubstudio/frontend/feature-build'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { isColor } from '@pubstudio/frontend/util-doc'
import { builtinThemeVariables } from '@pubstudio/frontend/util-ids'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import ThemeVariableList from './ThemeVariableList.vue'

const { t } = useI18n()

const { site } = useSiteSource()
const { newThemeVariable } = useThemeMenuVariables()

const themeVariables = computed<IThemeVariables>(() => {
  const builtin: IThemeVariable[] = []
  const custom: IThemeVariable[] = []
  for (const [key, value] of Object.entries(site.value?.context.theme.variables ?? {})) {
    const resolved = resolveThemeVariables(site.value.context, value) ?? ''
    const themeVar: IThemeVariable = {
      key,
      value,
      resolved,
      isColor: isColor(resolved),
    }
    if (key in builtinThemeVariables) {
      builtin.push(themeVar)
    } else {
      custom.push(themeVar)
    }
  }
  return { builtin, custom }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-variables-list {
  @mixin menu;
  padding: 0;
  width: 100%;
  .custom-info-bubble,
  .builtin-info-bubble {
    margin: 0 23px 0 0;
  }
}
.theme-variables-wrap {
  width: 100%;
  .builtin-title,
  .custom-title {
    @mixin flex-row;
    align-items: center;
    .label {
      font-weight: bold;
      flex-grow: 1;
    }
  }
  & + .theme-variables-wrap {
    margin-top: 24px;
  }
}
.theme-variables-empty {
  padding-top: 16px;
  @mixin text-medium 16px;
  color: $grey-500;
}
</style>
