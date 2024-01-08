<template>
  <div class="color-picker" :class="{ light: isLightTheme, gradient: isGradient }">
    <div class="picker-col" :style="{ width: totalWidth + 'px' }">
      <div class="color-set">
        <Saturation
          ref="saturation"
          :color="rgbString"
          :hsv="hsv"
          :size="hueHeight"
          @selectSaturation="selectSaturation"
        />
        <Hue
          ref="hue"
          :hsv="hsv"
          :width="hueWidth"
          :height="hueHeight"
          @selectHue="selectHue"
        />
        <Alpha
          ref="alpha"
          :color="rgbString"
          :rgba="rgba"
          :width="hueWidth"
          :height="hueHeight"
          @selectAlpha="selectAlpha"
        />
      </div>
      <div class="color-row" :style="{ height: previewHeight + 'px' }">
        <Preview
          v-if="!isGradient"
          :color="rgbaString"
          :width="previewWidth"
          :height="previewHeight"
        />
        <ColorPickerButton
          class="add-gradient-color"
          :class="{ gradient: isGradient }"
          @click="addGradientColor(rgbaString, c.themeVar)"
        >
          <Plus color="white" plusColor="#6a5cf5" class="plus" />
          {{ t('style.toolbar.add_gradient') }}
        </ColorPickerButton>
      </div>
      <Box name="HEX" :color="modelHex" @inputColor="inputHex" />
      <Box name="RGBA" :color="modelRgba" @inputColor="inputRgba" />
      <div class="select-wrap">
        <ColorPickerButton class="color-select" @click="emitResult">
          {{ t('style.toolbar.select_color') }}
        </ColorPickerButton>
        <Trash color="#b7436a" @click="clearColor" />
      </div>
      <!-- Selected theme colors -->
      <div class="theme-colors">
        <div v-if="selectedThemeColors.length" class="theme-color-grid">
          <div
            v-for="variable in selectedThemeColors"
            :key="variable.key"
            class="theme-color-cell"
            :style="{ 'background-color': variable.value }"
            @click="selectThemeColor(variable)"
          />
        </div>
        <div v-else class="theme-color-empty">
          {{ t('style.toolbar.no_theme_colors') }}
        </div>
      </div>
    </div>
    <div v-if="isGradient" class="picker-col" :style="{ width: totalWidth + 'px' }">
      <Gradient
        :selectedIndex="selectedIndex"
        :gradientType="gradientType"
        :gradientDegree="gradientDegree"
        :gradientColors="gradientColors"
        :computedGradient="computedGradient.raw"
        :computedGradientForBar="computedGradientForBar"
        @select="selectGradientColor"
        @update:type="gradientType = $event"
        @update:degree="updateGradientDegree"
        @update:stop="updateGradientStop"
        @blur:stop="sortGradientColors"
        @release:barHandle="sortGradientColors"
        @delete="deleteGradientColor"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { Plus, Trash } from '@pubstudio/frontend/ui-widgets'
import {
  IThemedGradient,
  ResolveThemeVarFn,
  normalizeHex,
} from '@pubstudio/frontend/util-gradient'
import { IRgba } from '@pubstudio/frontend/util-gradient'
import Saturation from './Saturation.vue'
import Hue from './Hue.vue'
import Alpha from './Alpha.vue'
import Preview from './Preview.vue'
import Gradient from './Gradient.vue'
import Box from './Box.vue'
import ColorPickerButton from './ColorPickerButton.vue'
import { setColorValue, rgb2hex, colorCodeToRgbaString } from '../lib/color-picker-util'
import { IPickerColor } from '../lib/i-picker-color'
import { IHsv } from '../lib/i-hsv'
import { useGradient } from '../lib/use-gradient'

const hueWidth = 15
const hueHeight = 152
const previewHeight = 26
const totalWidth = hueHeight + (hueWidth + 8) * 2
const previewWidth = totalWidth - previewHeight

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    color?: string
    gradient?: string
    // Hack to force non-gradient color for ProseMirror editor.
    // If we implement gradient colors for ProseMirror selections, this can be removed
    forceNonGradient?: boolean
    theme?: string
    colorsDefault?: string[]
    resolveThemeVar: ResolveThemeVarFn
    selectedThemeColors: IThemeVariable[]
  }>(),
  {
    color: '#000000',
    gradient: undefined,
    theme: 'dark',
    colorsDefault: () => [
      /*
      '#000000',
      '#FFFFFF',
      '#FF1900',
      '#F47365',
      '#FFB243',
      '#FFE623',
      '#6EFF2A',
      '#1BC7B1',
      '#00BEFF',
      '#2E81FF',
      '#5D61FF',
      '#FF89CF',
      '#FC3CAD',
      '#BF3DCE',
      '#8E00A7',
      'rgba(0,0,0,0)',
      */
    ],
  },
)
const { color, gradient, forceNonGradient, theme, resolveThemeVar } = toRefs(props)
const emit = defineEmits<{
  (e: 'selectColor', color: IPickerColor | undefined): void
  (e: 'applyGradient', gradient: IThemedGradient | undefined): void
}>()

interface IColor {
  r: number
  g: number
  b: number
  a: number
  h: number
  s: number
  v: number
  themeVar: string | undefined
}

const modelRgba = ref('')
const modelHex = ref('')
const c = reactive<IColor>({
  r: 0,
  g: 0,
  b: 0,
  a: 1,
  h: 0,
  s: 0,
  v: 0,
  themeVar: undefined,
})
const saturation = ref()
const hue = ref()
const alpha = ref()

const {
  selectedIndex,
  gradientType,
  gradientDegree,
  gradientColors,
  computedGradient,
  computedGradientForBar,
  addGradientColor,
  updateGradientDegree,
  updateSelectedGradientColor,
  updateGradientStop,
  sortGradientColors,
  deleteGradientColor,
} = useGradient({
  gradient: gradient.value,
  resolveThemeVar: resolveThemeVar.value,
})

const isGradient = computed(() => gradientColors.value.length > 1)

const isLightTheme = computed(() => theme.value === 'light')
const rgba = computed<IRgba>(() => ({
  r: c.r,
  g: c.g,
  b: c.b,
  a: c.a,
}))
const hsv = computed<IHsv>(() => ({
  h: c.h,
  s: c.s,
  v: c.v,
}))

const rgbString = computed(() => {
  return `rgb(${c.r}, ${c.g}, ${c.b})`
})
const rgbaStringShort = computed(() => {
  return `${c.r}, ${c.g}, ${c.b}, ${c.a}`
})
const rgbaString = computed(() => {
  return `rgba(${rgbaStringShort.value})`
})
const hexString = computed(() => {
  return rgb2hex(rgba.value, true)
})

const colorEmit = () => ({
  rgba: rgba.value,
  hsv: hsv.value,
  hex: modelHex.value,
  themeVar: c.themeVar,
})

const clearColor = () => {
  if (isGradient.value) {
    emit('applyGradient', undefined)
  } else {
    emit('selectColor', undefined)
  }
}

const selectSaturation = (color: IRgba) => {
  const { r, g, b, h, s, v } = setColorValue(color)
  Object.assign(c, { r, g, b, h, s, v, themeVar: undefined })
  setText()
  updateSelectedGradientColor(rgbaString.value)
}

const selectHue = async (color: any) => {
  const { r, g, b, h } = setColorValue(color)
  // Retain previous saturation
  Object.assign(c, { r, g, b, h, themeVar: undefined })
  setText()
  updateSelectedGradientColor(rgbaString.value)
  await rerender()
  saturation.value.recalculateSaturation()
}

const selectAlpha = (a: any) => {
  c.a = a
  c.themeVar = undefined
  setText()
  updateSelectedGradientColor(rgbaString.value)
}

const inputHex = async (color: string) => {
  const normalized = normalizeHex(color)
  const { r, g, b, a, h, s, v } = setColorValue(normalized ?? color)
  Object.assign(c, { r, g, b, a, h, s, v, themeVar: undefined })
  modelHex.value = color
  modelRgba.value = rgbaStringShort.value
  updateSelectedGradientColor(rgbaString.value)
  await rerender()
}

const rerender = async () => {
  await nextTick()
  saturation.value.renderColor()
  saturation.value.renderSlide()
  hue.value.renderSlide()
}

const inputRgba = async (color: string) => {
  const { r, g, b, a, h, s, v } = setColorValue(color)
  Object.assign(c, { r, g, b, a, h, s, v, themeVar: undefined })
  modelHex.value = hexString.value
  modelRgba.value = color
  updateSelectedGradientColor(rgbaString.value)
  await rerender()
}

const setText = () => {
  modelHex.value = hexString.value
  modelRgba.value = rgbaStringShort.value
}
const selectColor = async (color: string, themeVar?: string) => {
  const { r, g, b, a, h, s, v } = setColorValue(color)
  Object.assign(c, { r, g, b, a, h, s, v, themeVar })
  setText()
  await rerender()
}

const selectGradientColor = async (index: number) => {
  const gradientColor = gradientColors.value[index]
  await selectColor(gradientColor.rgba)
  selectedIndex.value = index
}

const selectThemeColor = async (themeVar: IThemeVariable) => {
  const rgba = colorCodeToRgbaString(themeVar.value)
  await selectColor(rgba, themeVar.key)
  if (isGradient.value) {
    updateSelectedGradientColor(rgba, themeVar.key)
  } else {
    emit('selectColor', colorEmit())
  }
}

const emitResult = () => {
  if (isGradient.value) {
    emit('applyGradient', computedGradient.value)
  } else {
    emit('selectColor', colorEmit())
  }
}

onMounted(async () => {
  let initialColor = gradientColors.value[0]?.rgba || color.value
  if (forceNonGradient.value) {
    initialColor = color.value
  }
  const resolved = resolveThemeVar.value(initialColor) ?? ''
  Object.assign(c, setColorValue(resolved))
  if (initialColor !== resolved) {
    c.themeVar = initialColor.match(/\$\{(.*?)\}/)?.[1] || undefined
  }
  setText()
  await rerender()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.color-picker {
  @mixin flex-col;
  color: $grey-100;
  background: #1d2024;
  border-radius: 4px;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
  z-index: 1;
  position: absolute;
  &.gradient {
    flex-direction: row;
  }
  &.light {
    background: #f7f8f9;
    .color-type {
      .name {
        background: #e7e8e9;
      }
      .value {
        color: #666;
        background: #eceef0;
      }
    }
    .theme-color-cell {
      border-color: #313233;
    }
  }
  .picker-col {
    padding: 10px;
    box-sizing: initial;
  }
  canvas {
    display: flex;
    height: 100%;
    width: 50%;
    aspect-ratio: 1;
  }
  .color-set {
    display: flex;
  }
  .apply-gradient-button {
    width: 100%;
    margin-top: 8px;
  }
  .color-row {
    display: flex;
    width: 100%;
    margin-top: 6px;
  }
  .select-wrap {
    display: flex;
    margin: 8px 6px 0 0;
    width: 100%;
    :deep(svg) {
      @mixin size 22px;
      margin-left: 6px;
      cursor: pointer;
    }
  }
  .color-select {
    padding: 6px 4px;
    flex-grow: 1;
  }
  .add-gradient-color {
    padding: 6px 4px;
    margin-left: 6px;
    flex-grow: 1;
    .plus {
      @mixin size 16px;
      margin-right: 4px;
    }
    &.gradient {
      width: 50%;
      margin-left: 0;
    }
  }
  .theme-colors {
    margin-top: 12px;
  }
  .theme-color-grid {
    @mixin flex-row;
    flex-wrap: wrap;
    margin: -8px 0 0 -8px;
  }
  .theme-color-cell {
    width: 17px;
    height: 17px;
    margin: 8px 0 0 8px;
    box-shadow: 0 1px 4px 1px rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
      transform: scale(1.1);
    }
  }
}
.theme-color-empty {
  @mixin title 13px;
  color: $grey-500;
}
</style>
