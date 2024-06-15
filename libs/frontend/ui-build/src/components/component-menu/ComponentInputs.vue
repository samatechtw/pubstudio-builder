<template>
  <div class="component-inputs">
    <EditMenuTitle
      :title="t('inputs')"
      :showAdd="!isCustomInstance"
      @add="
        emit('showEditInput', {
          name: '',
          type: ComponentArgPrimitive.String,
          default: '',
          attr: true,
          is: '',
        })
      "
    />
    <ComponentInputRow
      v-for="input in inputArray"
      :key="input[0]"
      :property="input[0]"
      :value="(input[1] ?? '').toString()"
      :argType="getArgType(input[0])"
      :tag="component.tag"
      :componentId="component.id"
      :showEditInput="!isCustomInstance"
      :showReset="mergedInputs[input[0]]?.source === ComponentInputSource.Self"
      :error="getError(input[0], input[1])"
      @editInput="emit('showEditInput', mergedInputs[input[0]])"
      @update="setInput(input[0], $event)"
      @reset="emit('removeInput', input[0])"
    >
      <Assets
        v-if="isImgSrcInput(input[0])"
        class="edit-icon asset-icon"
        @click="showSelectAssetModal = true"
      />
    </ComponentInputRow>
    <SelectAssetModal
      :show="showSelectAssetModal"
      :initialSiteId="siteIdProp"
      :contentTypes="[AssetContentType.Jpeg, AssetContentType.Png, AssetContentType.Gif]"
      @cancel="showSelectAssetModal = false"
      @select="onImageAssetSelected"
    />
  </div>
</template>

<script lang="ts">
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, IComponentInput, ISite } from '@pubstudio/shared/type-site'
import { omit } from '@pubstudio/frontend/util-component'
import { resolveInput } from '@pubstudio/frontend/feature-render'

interface IComponentInputWithSource extends IComponentInput {
  source: ComponentInputSource
}

enum ComponentInputSource {
  Custom,
  Self,
}

const computeComponentInputs = (
  site: ISite,
  component: IComponent,
): Record<string, IComponentInputWithSource> => {
  const mergedInputs: Record<string, IComponentInputWithSource> = {}

  // Append custom component inputs
  const customCmp = resolveComponent(site.context, component.customSourceId)
  if (customCmp) {
    Object.entries(customCmp.inputs ?? {}).forEach(([key, input]) => {
      mergedInputs[key] = {
        ...input,
        source: ComponentInputSource.Custom,
      }
    })
  }

  // Append custom inputs
  Object.entries(component.inputs ?? {}).forEach(([key, input]) => {
    mergedInputs[key] = {
      ...input,
      source: ComponentInputSource.Self,
    }
  })

  return mergedInputs
}
</script>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ComponentArgPrimitive, ComponentArgType, Tag } from '@pubstudio/shared/type-site'
import { Assets } from '@pubstudio/frontend/ui-widgets'
import { SelectAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import ComponentInputRow from './ComponentInputRow.vue'
import { useBuild, validateComponentArg } from '@pubstudio/frontend/feature-build'
import EditMenuTitle from '../EditMenuTitle.vue'

const { t } = useI18n()
const { site } = useBuild()

const props = defineProps<{
  component: IComponent
  siteId: string
}>()
const { component, siteId: siteIdProp } = toRefs(props)

const emit = defineEmits<{
  (e: 'setInput', input: IComponentInput): void
  (e: 'showEditInput', input: IComponentInput | undefined): void
  (e: 'removeInput', property: string): void
}>()

const showSelectAssetModal = ref(false)

const getError = (property: string, value: unknown): boolean => {
  const argType = getArgType(property)
  return !validateComponentArg(argType, value)
}

const getArgType = (property: string): ComponentArgType => {
  return component.value.inputs?.[property]?.type ?? ComponentArgPrimitive.String
}

const mergedInputs = computed(() => computeComponentInputs(site.value, component.value))

const inputArray = computed(() => {
  const inputs: Record<string, unknown> = {}
  const cmp = component.value
  const custom = resolveComponent(site.value.context, cmp.customSourceId)

  for (const [key, input] of Object.entries({ ...cmp.inputs, ...custom?.inputs })) {
    inputs[key] = resolveInput(site.value.context, input.is ?? input.default, false)
  }
  return Object.entries(inputs).sort((entryA, entryB) =>
    entryA[0].localeCompare(entryB[0]),
  )
})

const setInput = (property: string, newValue: unknown) => {
  const input = mergedInputs.value[property]
  // Delete extra fields from `IComponentInputWithSource` before
  // data being pushed to the command history.
  const newInput: IComponentInput = omit(input, 'source')
  newInput.is = newValue
  emit('setInput', newInput)
}

const isImgSrcInput = (property: string) => {
  return component.value.tag === Tag.Img && property === 'src'
}

const onImageAssetSelected = (asset: ISiteAssetViewModel) => {
  showSelectAssetModal.value = false
  setInput('src', urlFromAsset(asset))
}

const isCustomInstance = computed(() => !!component.value.customSourceId)
</script>

<style lang="postcss" scoped>
.component-inputs {
  width: 100%;
  padding: 0 16px;
}
</style>
