<template>
  <div class="video-edit">
    <Assets color="black" class="edit-icon" @click="showSelectSourceModal = true" />
    <SelectSourceModal
      :show="showSelectSourceModal"
      :initialSiteId="getSiteId()"
      :contentTypes="ContentTypes"
      :initialUrl="currentUrl"
      @cancel="showSelectSourceModal = false"
      @select="onAssetSelected"
      @externalUrl="onUrlSelected"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Assets } from '@pubstudio/frontend/ui-widgets'
import { addOrUpdateComponentInput } from '@pubstudio/frontend/feature-build'
import { SelectSourceModal } from '@pubstudio/frontend/feature-site-assets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { getAdjacentVideo } from '@pubstudio/frontend/util-component'
import { ComponentArgPrimitive, Tag } from '@pubstudio/shared/type-site'
import { CommandType } from '@pubstudio/shared/type-command'
import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { defaultSourceInputs } from '@pubstudio/frontend/util-builtin'

const { editor, site, siteStore } = useSiteSource()

const ContentTypes = [AssetContentType.Mp4]
const showSelectSourceModal = ref(false)

const { componentId } = defineProps<{
  componentId: string | undefined
}>()

const videoCmp = computed(() => {
  const cmp = resolveComponent(site.value.context, componentId)
  return getAdjacentVideo(cmp)
})

const currentUrl = computed(() => {
  const source = videoCmp.value?.children?.[0]
  return source?.inputs?.['src']?.is as string | undefined
})

const getSiteId = () => {
  return siteStore.siteId as unknown as string
}

const onAssetSelected = (asset: ISiteAssetViewModel) => {
  const assetUrl = urlFromAsset(asset)
  onUrlSelected(assetUrl)
}

const onUrlSelected = (url: string) => {
  if (videoCmp.value) {
    const source = videoCmp.value?.children?.find((c) => c.tag === Tag.Source)
    if (source) {
      addOrUpdateComponentInput(site.value, source, 'src', {
        type: ComponentArgPrimitive.String,
        name: 'src',
        attr: true,
        is: url,
      })
    } else {
      const sourceData: IAddComponentData = {
        name: 'VideoSource',
        tag: Tag.Source,
        parentId: videoCmp.value.id,
        parentIndex: 0,
        style: { custom: {} },
        inputs: defaultSourceInputs(url),
        selectedComponentId: editor.value?.selectedComponent?.id,
      }
      pushCommand(site.value, CommandType.AddComponent, sourceData)
    }
  }
  showSelectSourceModal.value = false
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.video-edit {
  @mixin flex-center;
  position: absolute;
}
.edit-icon {
  @mixin size 26px;
  filter: drop-shadow(0px 0px 1.5px rgb(255 255 255 / 0.9));
}
</style>
