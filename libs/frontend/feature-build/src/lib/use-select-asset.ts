import { AssetContentType } from '@pubstudio/shared/type-api-platform-site-asset'
import { Ref, ref } from 'vue'

const ContentTypes = [AssetContentType.Jpeg, AssetContentType.Png, AssetContentType.Gif]

export interface IUseSelectAsset {
  contentTypes: AssetContentType[]
  showSelectAssetModal: Ref<boolean>
}

export const useSelectAsset = (): IUseSelectAsset => {
  const showSelectAssetModal = ref(false)

  return {
    contentTypes: ContentTypes,
    showSelectAssetModal,
  }
}
