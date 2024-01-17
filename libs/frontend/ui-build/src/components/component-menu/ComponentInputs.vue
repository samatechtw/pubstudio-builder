<template>
  <div class="component-inputs">
    <EditMenuTitle
      :title="t('inputs')"
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
      :showEditInput="input[0] in (component.inputs ?? {})"
      :error="getError(input[0], input[1])"
      @editInput="emit('showEditInput', (component.inputs ?? {})[input[0]])"
      @update="setInput(input[0], $event)"
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

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  ComponentArgPrimitive,
  ComponentArgType,
  IComponent,
  IComponentInput,
  Tag,
} from '@pubstudio/shared/type-site'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { computeAttrsInputsMixins } from '@pubstudio/frontend/feature-render'
import { Assets } from '@pubstudio/frontend/ui-widgets'
import { SelectAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import ComponentInputRow from './ComponentInputRow.vue'
import {
  IInputUpdate,
  useBuild,
  validateComponentArg,
} from '@pubstudio/frontend/feature-build'
import EditMenuTitle from '../EditMenuTitle.vue'

const { t } = useI18n()
const { site } = useBuild()

const props = defineProps<{
  component: IComponent
  siteId: string
}>()
const { component, siteId: siteIdProp } = toRefs(props)

const emit = defineEmits<{
  (e: 'setInput', data: IInputUpdate): void
  (e: 'showEditInput', input: IComponentInput | undefined): void
}>()

const showSelectAssetModal = ref(false)

const getError = (property: string, value: unknown): boolean => {
  const argType = getArgType(property)
  return !validateComponentArg(argType, value)
}

const getArgType = (property: string): ComponentArgType => {
  return component.value.inputs?.[property]?.type ?? ComponentArgPrimitive.String
}

const inputArray = computed(() => {
  const { inputs } = computeAttrsInputsMixins(site.value.context, component.value, {
    renderMode: RenderMode.Build,
    resolveTheme: false,
  })
  return Object.entries(inputs).sort((entryA, entryB) =>
    entryA[0].localeCompare(entryB[0]),
  )
})

const setInput = (property: string, newValue: unknown) => {
  emit('setInput', { property, newValue })
}

const isImgSrcInput = (property: string) => {
  return component.value.tag === Tag.Img && property === 'src'
}

const onImageAssetSelected = (asset: ISiteAssetViewModel) => {
  showSelectAssetModal.value = false
  setInput('src', urlFromAsset(asset))
}
</script>

<style lang="postcss" scoped>
.component-inputs {
  width: 100%;
  padding: 0 16px;
}
</style>
