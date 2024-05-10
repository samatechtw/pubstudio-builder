<template>
  <ToolbarFlex
    :modelValue="currentValue"
    :label="t('toolbar.basis')"
    :isAuto="isAuto"
    :invalid="invalid"
    inputWrapClass="flex-basis-input"
    class="flex-basis"
    @update:modelValue="updateBasis"
    @inputClick="clickInputWrap"
  >
    <SizeUnit
      ref="unitRef"
      :size="parsedSize"
      clickawayIgnoreSelector=".flex-basis"
      @updateSize="selectUnit"
    />
  </ToolbarFlex>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ICssSize, IParsedFlex } from '@pubstudio/frontend/util-component'
import { useCssSize } from '@pubstudio/frontend/feature-build'
import ToolbarFlex from './ToolbarFlex.vue'
import SizeUnit from '../SizeUnit.vue'

const { t } = useI18n()

const props = defineProps<{
  flex: IParsedFlex
}>()
const { flex } = toRefs(props)
const emit = defineEmits<{
  (e: 'updateBasis', basis: string | undefined): void
}>()

const getBasis = () => {
  return flex.value.basis
}

const {
  parsedSize,
  currentValue,
  invalid,
  isAuto,
  unitRef,
  clickInputWrap,
  updatedSize,
  handleInput,
} = useCssSize({
  getSize: getBasis,
  defaultUnit: '%',
})

const emitUpdate = () => {
  const basisStr = updatedSize()
  emit('updateBasis', basisStr)
}

const updateBasis = (basis: string) => {
  const newChars = handleInput(basis)
  if (newChars === '%') {
    selectUnit({ ...parsedSize.value, unit: '%' })
  }
  emitUpdate()
}

const selectUnit = (size: ICssSize) => {
  parsedSize.value = { ...size }
  emitUpdate()
}
</script>

<style lang="postcss" scoped>
.flex-basis {
  align-items: flex-start;
  :deep(.flex-label) {
    padding-left: 3px;
  }
}
</style>
