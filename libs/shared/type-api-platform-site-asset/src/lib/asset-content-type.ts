export enum AssetContentType {
  Jpeg = 'image/jpeg',
  Png = 'image/png',
  Webp = 'image/webp',
  Svg = 'image/svg+xml',
  Gif = 'image/gif',
  Mp4 = 'video/mp4',
  Pdf = 'application/pdf',
  Otf = 'font/otf',
  Ttf = 'font/ttf',
  Woff2 = 'font/woff2',
  Wasm = 'application/wasm',
  Js = 'text/javascript',
}

export const ALL_CONTENT_TYPES = Object.values(AssetContentType)

export const MEDIA_CONTENT_TYPES = [
  AssetContentType.Jpeg,
  AssetContentType.Png,
  AssetContentType.Webp,
  AssetContentType.Svg,
  AssetContentType.Gif,
  AssetContentType.Mp4,
  AssetContentType.Wasm,
  AssetContentType.Js,
]

export const CONTENT_TYPE_EXTS = {
  [AssetContentType.Jpeg]: 'jpg',
  [AssetContentType.Png]: 'png',
  [AssetContentType.Webp]: 'webp',
  [AssetContentType.Svg]: 'svg',
  [AssetContentType.Gif]: 'gif',
  [AssetContentType.Mp4]: 'mp4',
  [AssetContentType.Pdf]: 'pdf',
  [AssetContentType.Wasm]: 'wasm',
  [AssetContentType.Js]: 'js',
  [AssetContentType.Otf]: 'otf',
  [AssetContentType.Ttf]: 'ttf',
  [AssetContentType.Woff2]: 'woff2',
}

export const extFromContentType = (contentType: string): string | undefined => {
  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'application/pdf': 'pdf',
    'font/otf': 'otf',
    'font/ttf': 'ttf',
    'font/woff2': 'woff2',
    'application/wasm': 'wasm',
    'text/javascript': 'js',
  }[contentType]
}
