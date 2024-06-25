<template>
  <div class="image-edit" :style="{ top: `${offsetTop}px` }">
    <Assets color="black" class="edit-icon" @click="showSelectAssetModal = true" />
    <SelectAssetModal
      :show="showSelectAssetModal"
      :initialSiteId="getSiteId()"
      :contentTypes="contentTypes"
      @cancel="showSelectAssetModal = false"
      @select="onAssetSelected"
      @externalUrl="onUrlSelected"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { Assets } from '@pubstudio/frontend/ui-widgets'
import { useBuild, useSelectAsset, useToolbar } from '@pubstudio/frontend/feature-build'
import { SelectAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { computeComponentOffset } from '@pubstudio/frontend/util-builder'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  ComponentArgPrimitive,
  Css,
  IComponentInput,
  Tag,
} from '@pubstudio/shared/type-site'
import { clone } from '@pubstudio/frontend/util-component'

const { addOrUpdateSelectedInput, selectedComponentFlattenedStyles } = useBuild()
const { setOrRemoveStyle } = useToolbar()
const { site, siteStore } = useSiteSource()
const { showSelectAssetModal, contentTypes } = useSelectAsset()
const offsetTop = ref(-28)

const props = defineProps<{
  componentId: string | undefined
}>()
const { componentId } = toRefs(props)

const getSiteId = () => {
  return siteStore.value.siteId as unknown as string
}

const onAssetSelected = (asset: ISiteAssetViewModel) => {
  const assetUrl = urlFromAsset(asset)
  onUrlSelected(assetUrl)
}

const onUrlSelected = (url: string) => {
  const component = resolveComponent(site.value.context, componentId.value)
  if (component) {
    if (component.tag === Tag.Img) {
      const input: IComponentInput = clone(component.inputs?.src) ?? {
        type: ComponentArgPrimitive.String,
        name: 'src',
        default: '',
        attr: true,
        is: url,
      }
      input.is = url
      addOrUpdateSelectedInput(input.name, input)
    } else {
      const style = selectedComponentFlattenedStyles.value['background-image']
      if (style) {
        setOrRemoveStyle(Css.BackgroundImage, `url("${url}")`)
      }
    }
    showSelectAssetModal.value = false
  }
}

const computeOffset = () => {
  offsetTop.value = computeComponentOffset(componentId.value) ?? offsetTop.value
}

onMounted(() => {
  computeOffset()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.image-edit {
  @mixin flex-center;
  position: absolute;
}
.edit-icon {
  @mixin size 26px;
  filter: drop-shadow(0px 0px 1.5px rgb(255 255 255 / 0.9));
}
</style>
