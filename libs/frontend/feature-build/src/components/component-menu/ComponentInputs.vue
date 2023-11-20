<template>
  <div class="component-inputs">
    <EditMenuTitle
      :title="t('inputs')"
      @add="
        emit('showEditInput', {
          name: '',
          type: ComponentArgPrimitive.String,
          default: '',
          attr: false,
          is: '',
        })
      "
    />
    <ComponentInputRow
      v-for="input in inputArray"
      :key="input[0]"
      :property="input[0]"
      :value="(input[1] ?? '').toString()"
      :argType="component.inputs?.[input[0]]?.type"
      :tag="component.tag"
      :componentId="component.id"
      :showEditInput="input[0] in (component.inputs ?? {})"
      :error="getError(input[0], input[1])"
      @editInput="emit('showEditInput', (component.inputs ?? {})[input[0]])"
      @update="setInput(input[0], $event)"
    />
  </div>
</template>

<script lang="ts">
export interface IInputUpdate {
  property: string
  newValue: unknown
}
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ComponentArgPrimitive,
  ComponentArgType,
  IComponent,
  IComponentInput,
} from '@pubstudio/shared/type-site'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { computeAttrsInputsMixins } from '@pubstudio/frontend/feature-render'
import ComponentInputRow from './ComponentInputRow.vue'
import { useBuild } from '../../lib/use-build'
import EditMenuTitle from '../EditMenuTitle.vue'
import { validateComponentArg } from '../../lib/validate-component-arg'

const { t } = useI18n()
const { site } = useBuild()

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const emit = defineEmits<{
  (e: 'setInput', data: IInputUpdate): void
  (e: 'showEditInput', input: IComponentInput | undefined): void
}>()

const getError = (property: string, value: unknown): boolean => {
  const argType = component.value.inputs?.[property]?.type as ComponentArgType
  return !validateComponentArg(argType, value)
}

const inputArray = computed(() => {
  const { inputs } = computeAttrsInputsMixins(site.value.context, component.value, {
    renderMode: RenderMode.Build,
    resolveTheme: false,
  })
  return Object.entries(inputs)
})

const setInput = (property: string, newValue: unknown) => {
  emit('setInput', { property, newValue })
}
</script>

<style lang="postcss" scoped>
.component-inputs {
  width: 100%;
  padding: 0 16px;
}
</style>
