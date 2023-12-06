import {
  GradientType,
  IGradientColor,
  IThemedGradient,
  parseGradientColors,
  parseGradientDegree,
  parseGradientType,
  ResolveThemeVarFn,
} from '@pubstudio/frontend/util-gradient'
import { computed, ComputedRef, ref, Ref } from 'vue'
import { computeGradient } from './compute-gradient'

export interface IGradientOptions {
  gradient: string | undefined
  resolveThemeVar: ResolveThemeVarFn
}

export interface IUpdateGradientStopParams {
  index: number
  stop: number
}

export interface IGradientFeature {
  selectedIndex: Ref<number>
  gradientType: Ref<GradientType>
  // Only used in linear gradient
  gradientDegree: Ref<number>
  gradientColors: Ref<IGradientColor[]>
  // Computed gradient CSS value based on selected gradient type
  computedGradient: ComputedRef<IThemedGradient>
  // Computed linear-gradient CSS value for gradient bar
  computedGradientForBar: ComputedRef<string>
  addGradientColor: (rgba: string, themeVar?: string) => void
  updateGradientDegree: (degree: number) => void
  updateSelectedGradientColor: (rgba: string, themeVar?: string) => void
  updateGradientStop: (params: IUpdateGradientStopParams) => void
  // Sort gradient colors by stop in ascending order
  sortGradientColors: () => void
  deleteGradientColor: (index: number) => void
}

export const useGradient = (options: IGradientOptions): IGradientFeature => {
  const { gradient, resolveThemeVar } = options

  const selectedIndex = ref(0)
  const gradientType = ref(parseGradientType(gradient))
  const gradientDegree = ref(parseGradientDegree(gradient))
  const gradientColors = ref(parseGradientColors(gradient, resolveThemeVar))

  const computedGradient = computed(() => {
    return computeGradient(gradientType.value, gradientDegree.value, gradientColors.value)
  })

  const computedGradientForBar = computed(
    () => computeGradient(GradientType.Linear, 90, gradientColors.value).raw,
  )

  const addGradientColor = (rgba: string, themeVar?: string) => {
    const selectedColor: IGradientColor = {
      rgba,
      stop: 0,
      themeVar,
    }
    if (gradientColors.value.length < 2) {
      gradientColors.value = [
        selectedColor,
        {
          rgba: 'rgba(0, 0, 0, 1)',
          stop: 100,
        },
      ]
      selectedIndex.value = 0
    } else {
      gradientColors.value.push(selectedColor)
      selectedIndex.value = gradientColors.value.length - 1
    }
  }

  const updateGradientDegree = (degree: number) => {
    gradientDegree.value = degree
  }

  const updateSelectedGradientColor = (rgba: string, themeVar?: string) => {
    const gradientColor = gradientColors.value[selectedIndex.value]
    if (gradientColor) {
      gradientColor.rgba = rgba
      gradientColor.themeVar = themeVar
    }
  }

  const updateGradientStop = (params: IUpdateGradientStopParams) => {
    const { index, stop } = params
    const gradientColor = gradientColors.value[index]
    if (gradientColor) {
      gradientColor.stop = stop
    }
  }

  const sortGradientColors = () => {
    const selectedColor = gradientColors.value[selectedIndex.value]
    gradientColors.value.sort((a, b) => a.stop - b.stop)
    if (selectedColor) {
      selectedIndex.value = gradientColors.value.indexOf(selectedColor)
    }
  }

  const deleteGradientColor = (index: number) => {
    gradientColors.value.splice(index, 1)
    if (selectedIndex.value === index) {
      selectedIndex.value = 0
    }
  }

  return {
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
  }
}
