<template>
  <div class="preference-general">
    <div class="modal-text" v-html="t('prefs.text')"></div>
    <PreferenceRow :label="t('prefs.bounding')" :text="t('prefs.bounding_text')">
      <PSToggle
        :on="!!getPref(editor, 'debugBounding')"
        small
        class="bounding-toggle"
        @toggle="setPref(editor, 'debugBounding', $event)"
      />
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.opacity')" :text="t('prefs.opacity')">
      <PSToggle
        :on="!!getPref(editor, 'overrideOpacity')"
        small
        class="opacity-toggle"
        @toggle="setPref(editor, 'overrideOpacity', $event)"
      />
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.transform')" :text="t('prefs.transform_text')">
      <PSToggle
        :on="!!getPref(editor, 'overrideTransform')"
        small
        class="transform-toggle"
        @toggle="setPref(editor, 'overrideTransform', $event)"
      />
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.selected')" :text="t('prefs.selected_text')">
      <div class="color-wrap outline-color-wrap">
        <div
          ref="itemRef"
          class="color-display"
          :style="{ 'background-color': selectedOutlineColor }"
          @click="showOutlinePicker"
        />
        <div ref="tooltipRef">
          <ColorPicker
            v-if="showOutlineColorPicker"
            :color="selectedOutlineColor"
            :forceNonGradient="true"
            :selectedThemeColors="[]"
            class="color-picker"
            :style="{ ...outlineTooltip.tooltipStyle, 'z-index': 7000 }"
            @selectColor="setSelectedOutlineColor($event?.hex)"
          />
        </div>
      </div>
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.menu_hover')" :text="t('prefs.menu_hover_text')">
      <PSToggle
        :on="!!getPref(editor, 'componentMenuHover')"
        small
        class="menu-hover-toggle"
        @toggle="setPref(editor, 'componentMenuHover', $event)"
      />
    </PreferenceRow>
    <PreferenceRow
      :label="t('prefs.component_hover')"
      :text="t('prefs.component_hover_text')"
    >
      <PSToggle
        :on="!!getPref(editor, 'componentHover')"
        small
        class="component-hover-toggle"
        @toggle="setPref(editor, 'componentHover', $event)"
      />
    </PreferenceRow>
    <PreferenceRow :label="t('prefs.hover_color')" :text="t('prefs.hover_color_text')">
      <div class="color-wrap hover-color-wrap">
        <div
          ref="itemRef"
          class="color-display"
          :style="{ 'background-color': selectedHoverColor }"
          @click="showHoverPicker"
        />
        <div ref="tooltipRef">
          <ColorPicker
            v-if="showHoverColorPicker"
            :color="selectedHoverColor"
            :forceNonGradient="true"
            :selectedThemeColors="[]"
            class="color-picker"
            :style="{ ...hoverTooltip.tooltipStyle, 'z-index': 7000 }"
            @selectColor="setSelectedHoverColor($event?.hex)"
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
const outlineTooltip = useTooltip({
  placement: 'top-end',
  offset: 310,
  offsetCross: -178,
  shift: false,
})
const hoverTooltip = useTooltip({
  placement: 'top-end',
  offset: 310,
  offsetCross: -178,
  shift: false,
})

const hideOutlinePicker = () => {
  outlineTooltip.tooltipMouseLeave()
  showOutlineColorPicker.value = false
}
const hideHoverPicker = () => {
  hoverTooltip.tooltipMouseLeave()
  showHoverColorPicker.value = false
}
useClickaway('.outline-color-wrap', hideOutlinePicker)
useClickaway('.hover-color-wrap', hideHoverPicker)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const showOutlineColorPicker = ref(false)
const showHoverColorPicker = ref(false)

const selectedOutlineColor = computed(() => {
  return getPref(editor.value, 'selectedComponentOutlineColor')
})

const showOutlinePicker = () => {
  showOutlineColorPicker.value = true
  outlineTooltip.tooltipMouseEnter()
  outlineTooltip.updatePosition()
}

const setSelectedOutlineColor = (color: string | undefined) => {
  setPref(editor.value, 'selectedComponentOutlineColor', color)
  hideOutlinePicker()
}

const selectedHoverColor = computed(() => {
  return getPref(editor.value, 'componentHoverColor')
})

const showHoverPicker = () => {
  showHoverColorPicker.value = true
  hoverTooltip.tooltipMouseEnter()
  hoverTooltip.updatePosition()
}

const setSelectedHoverColor = (color: string | undefined) => {
  setPref(editor.value, 'componentHoverColor', color)
  hideHoverPicker()
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
  padding: 16px 0 24px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  margin-top: auto;
}
.color-picker {
  position: relative;
  top: 0;
}
.color-wrap {
  width: 40px;
  text-align: center;
  position: relative;
}
.color-display {
  width: 22px;
  height: 22px;
  border-radius: 2px;
  cursor: pointer;
}
</style>
