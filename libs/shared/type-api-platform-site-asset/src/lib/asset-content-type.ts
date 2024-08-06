export enum AssetContentType {
  Jpeg = 'image/jpeg',
  Png = 'image/png',
  Svg = 'image/svg+xml',
  Gif = 'image/gif',
  Mp4 = 'video/mp4',
  Pdf = 'application/pdf',
  Wasm = 'application/wasm',
  Js = 'text/javascript',
}

export const ALL_CONTENT_TYPES = Object.values(AssetContentType)

export const MEDIA_CONTENT_TYPES = [
  AssetContentType.Jpeg,
  AssetContentType.Png,
  AssetContentType.Svg,
  AssetContentType.Gif,
  AssetContentType.Mp4,
  AssetContentType.Wasm,
  AssetContentType.Js,
]
