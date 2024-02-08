import {
  CssSizeRegex,
  CssSizeUnit,
  ICssSize,
  parseCssSize,
} from '@pubstudio/frontend/util-component'
import { computed, ComputedRef, onMounted, Ref, ref, watch } from 'vue'

export interface IUseCssSize {
  parsedSize: Ref<ICssSize>
  isAuto: ComputedRef<boolean>
  currentValue: ComputedRef<string>
  invalid: Ref<boolean>
  inputRef: Ref<HTMLElement | null>
  unitRef: Ref<HTMLElement | null>
  clickInputWrap: () => void
  inputKeydown: (e: KeyboardEvent) => void
  parseSize: () => void
  updatedSize: () => string | undefined
  handleInput: (newValue: string) => void
  setInputValue: (val: string) => void
}

export interface IUseCssSizeProps {
  getSize: () => string | undefined
  defaultUnit?: CssSizeUnit
}

export const useCssSize = (params: IUseCssSizeProps): IUseCssSize => {
  const { getSize } = params
  const defaultUnit = params.defaultUnit ?? 'px'
  const invalid = ref(false)
  const inputRef = ref()
  const unitRef = ref()

  const parseSize = () => {
    const str = getSize()
    return parseCssSize(str, defaultUnit)
  }

  const parsedSize = ref<ICssSize>(parseSize())

  const isAuto = computed(() => parsedSize.value.unit === 'auto')

  const currentValue = computed(() => {
    if (isAuto.value) {
      return 'auto'
    }
    return parsedSize.value.value
  })

  const handleInput = (newValue: string) => {
    invalid.value = false
    const newChars = newValue.slice(parsedSize.value.value.length)
    if (newChars && !/^(\d|\.)*$/.test(newChars)) {
      setInputValue(parsedSize.value.value)
      return
    }
    parsedSize.value.value = newValue
    if (newValue && parsedSize.value.unit === '-') {
      parsedSize.value.unit = defaultUnit
    }
  }

  const setInputValue = (val: string) => {
    if (inputRef.value) {
      ;(inputRef.value as HTMLInputElement).value = val ?? ''
    }
  }

  const updatedSize = (): string | undefined => {
    const { unit, value } = parsedSize.value
    if (unit === '-') {
      return undefined
    } else if (!unit) {
      parsedSize.value.unit = defaultUnit
    }
    const newSize = `${value}${parsedSize.value.unit}`
    if (getSize() === newSize) {
      // Don't update if value didn't change
    } else if (CssSizeRegex.test(newSize)) {
      return newSize
    } else {
      invalid.value = true
    }
  }

  const clickInputWrap = () => {
    if (isAuto.value || unitRef.value?.opened) {
      unitRef.value?.toggleMenu()
    }
  }

  const inputKeydown = (e: KeyboardEvent) => {
    const isZ = e.key === 'Z' || e.key === 'z'
    if (isZ && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault()
    }
  }

  watch(getSize, () => {
    parsedSize.value = parseSize()
  })

  onMounted(() => {
    parsedSize.value = parseSize()
  })

  return {
    parsedSize,
    currentValue,
    isAuto,
    invalid,
    inputRef,
    unitRef,
    clickInputWrap,
    inputKeydown,
    parseSize,
    handleInput,
    updatedSize,
    setInputValue,
  }
}
