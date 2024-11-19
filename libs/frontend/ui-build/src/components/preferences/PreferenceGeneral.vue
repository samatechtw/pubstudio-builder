<template>
  <div class="preference-general">
    <div class="modal-text" v-html="t('prefs.text')"></div>
    <PreferenceRow :label="t('prefs.bounding')" :text="t('prefs.bounding_text')">
      <PSToggle
        :on="!!editor?.prefs.debugBounding"
        small
        class="bounding-toggle"
        @toggle="setPref(editor, 'debugBounding', $event)"
      />
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.opacity')" :text="t('prefs.opacity')">
      <PSToggle
        :on="!!editor?.prefs.overrideOpacity"
        small
        class="opacity-toggle"
        @toggle="setPref(editor, 'overrideOpacity', $event)"
      />
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.transform')" :text="t('prefs.transform_text')">
      <PSToggle
        :on="!!editor?.prefs.overrideTransform"
        small
        class="transform-toggle"
        @toggle="setPref(editor, 'overrideTransform', $event)"
      />
    </PreferenceRow>
    <div class="modal-buttons">
      <PSButton
        :text="t('done')"
        class="close-button"
        size="small"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { PSToggle, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { setPref } from '@pubstudio/frontend/data-access-command'
import PreferenceRow from './PreferenceRow.vue'

const { t } = useI18n()
const { editor } = useSiteSource()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.modal-text {
  @mixin text-medium 16px;
  color: $grey-700;
  margin-bottom: 16px;
}
.preference-general {
  @mixin flex-col;
  height: 100%;
}
.modal-buttons {
  @mixin flex-row;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  margin-top: auto;
}
</style>
