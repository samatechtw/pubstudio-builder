<template>
  <div class="context-vars">
    <!-- eslint-disable -->
    <InfoBubble
      :message="t('behavior_context.site')"
      placement="right"
      :customIcon="true"
      class="context-var"
    >
      site
    </InfoBubble>
    <InfoBubble
      :message="t('behavior_context.component')"
      placement="right"
      :customIcon="true"
      class="context-var"
    >
      component
    </InfoBubble>
    <InfoBubble
      :message="t('behavior_context.context')"
      placement="right"
      :customIcon="true"
      class="context-var"
    >
      context
    </InfoBubble>
    <!-- eslint-enable -->
    <InfoBubble
      placement="right"
      class="context-var"
      messageClass="behavior-helpers"
      color="#212629"
      :customIcon="true"
    >
      {{ t('helpers') }}
      <template #message>
        <div class="bh-title">
          {{ t('behavior_context.title') }}
        </div>
        <div v-for="helper in Object.keys(behaviorHelpers)" :key="helper" class="helper">
          <span class="helper-title">{{ helper }}</span>
          {{ t(`behavior_context.${helper}`) }}
        </div>
      </template>
    </InfoBubble>
  </div>
</template>

<script lang="ts" setup>
import { InfoBubble } from '@pubstudio/frontend/ui-widgets'
import { behaviorHelpers } from '@pubstudio/frontend/util-builtin'
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.context-vars {
  @mixin flex-row;
}
.context-var {
  @mixin flex-row;
  align-items: center;
  color: $grey-700;
  margin-top: 4px;
  width: auto;
  &:not(:first-child) {
    margin-left: 6px;
  }
}
.var-label {
  margin-right: 6px;
  width: auto;
  &:hover {
    color: $grey-900;
  }
}
</style>
