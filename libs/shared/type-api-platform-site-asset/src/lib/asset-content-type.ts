export enum AssetContentType {
  Jpeg = 'image/jpeg',
  Png = 'image/png',
  Gif = 'image/gif',
  Mp4 = 'video/mp4',
  Pdf = 'application/pdf',
  Wasm = 'application/wasm',
}

export const ALL_CONTENT_TYPES = Object.values(AssetContentType)

export const MEDIA_CONTENT_TYPES = [
  AssetContentType.Jpeg,
  AssetContentType.Png,
  AssetContentType.Gif,
  AssetContentType.Mp4,
  AssetContentType.Wasm,
]
