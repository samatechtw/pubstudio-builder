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
    <PreferenceRow :label="t('prefs.transform')" :text="t('prefs.transform_text')">
      <div class="color-wrap">
        <div
          ref="itemRef"
          class="selected-outline-color"
          :style="{ 'background-color': selectedOutlineColor }"
          @click="showOutlinePicker"
        />
        <div ref="tooltipRef">
          <ColorPicker
            v-if="showOutlineColorPicker"
            :color="selectedOutlineColor"
            :forceNonGradient="true"
            :selectedThemeColors="[]"
            class="outline-color-picker"
            :style="{ ...tooltipStyle, 'z-index': 7000 }"
            @selectColor="setSelectedOutlineColor($event?.hex)"
          />
        </div>
      </div>
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
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useClickaway, useTooltip } from '@samatech/vue-components'
import { ColorPicker } from '@samatech/vue-color-picker'
import { PSToggle, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { getPref, setPref } from '@pubstudio/frontend/data-access-command'
import PreferenceRow from './PreferenceRow.vue'

const { t } = useI18n()
const { editor } = useSiteSource()
const {
  itemRef,
  tooltipRef,
  tooltipStyle,
  updatePosition,
  tooltipMouseEnter,
  tooltipMouseLeave,
} = useTooltip({
  placement: 'top-end',
  offset: 310,
  offsetCross: -178,
  shift: false,
})

const hideOutlinePicker = () => {
  tooltipMouseLeave()
  showOutlineColorPicker.value = false
}
useClickaway('.color-wrap', hideOutlinePicker)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const showOutlineColorPicker = ref(false)

const selectedOutlineColor = computed(() => {
  return getPref(editor.value, 'selectedComponentOutlineColor')
})

const showOutlinePicker = () => {
  showOutlineColorPicker.value = true
  tooltipMouseEnter()
  updatePosition()
}

const setSelectedOutlineColor = (color: string | undefined) => {
  setPref(editor.value, 'selectedComponentOutlineColor', color)
  hideOutlinePicker()
}
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
  padding-bottom: 24px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  margin-top: auto;
}
.outline-color-picker {
  position: relative;
  top: 0;
}
.color-wrap {
  width: 40px;
  text-align: center;
  position: relative;
}
.selected-outline-color {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
