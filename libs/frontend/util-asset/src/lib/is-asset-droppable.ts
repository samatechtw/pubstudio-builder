import { AssetContentType } from '@pubstudio/shared/type-api-platform-site-asset'

export const isAssetDroppable = (contentType: AssetContentType | string) => {
  const undroppableTypes: string[] = [AssetContentType.Wasm, AssetContentType.Js]
  return !undroppableTypes.includes(contentType)
}
