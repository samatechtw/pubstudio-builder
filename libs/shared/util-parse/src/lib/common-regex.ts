export const commonRegex = {
  date: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3,6}Z',
  uuid: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}',
  jwt: '[A-Za-z0-9-_]+.[A-Za-z0-9-_]+.([A-Za-z0-9-_]{43})',
  assetUrl: /^https:\/\/.+?\.r2\.cloudflarestorage\.com$/,
  templatePreviewUrl:
    /^https:\/\/.+?\.r2\.cloudflarestorage\.com\/template-previews\/.+?X-Amz-Credential.+?$/,
}
