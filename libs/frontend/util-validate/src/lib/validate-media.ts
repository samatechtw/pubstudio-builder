import { AssetContentType } from '@pubstudio/shared/type-api-platform-site-asset'

export interface MediaRequirements {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  ext?: string[]
  type?: AssetContentType
  size?: number
}

export interface ValidatedFile {
  file: File
  type: AssetContentType
  src?: string
}

export interface IValidateMediaError {
  fileErrors: string[]
}

export async function validateMedia(
  requirements: MediaRequirements,
  file: File,
): Promise<ValidatedFile> {
  const errors: string[] = []
  const URL = window.URL || window.webkitURL
  let img: HTMLImageElement | null = null
  let video: HTMLVideoElement | null = null
  const validTypes = requirements.type ?? Object.values(AssetContentType)
  const type = file.type as AssetContentType

  const { ext, size } = requirements
  const reqSize = size ?? 0
  if (reqSize && file.size > reqSize) {
    errors.push('FILE_SIZE_BIG')
  }
  const fileExt = file.name.split('.').pop()
  if ((ext && (!fileExt || !ext.includes(fileExt))) || !validTypes.includes(type)) {
    errors.push('FILE_TYPE')
  }
  if (errors.length) {
    throw { fileErrors: errors }
  }

  const result: ValidatedFile = { file, type }
  result.src = URL.createObjectURL(file)

  try {
    const fileType = file.type || ''
    if (fileType.includes('image')) {
      img = new Image()
      img.src = result.src
      return new Promise((resolve, reject) => {
        if (img) {
          img.onload = function () {
            const { minWidth, minHeight, maxWidth, maxHeight } = requirements
            const { width: imgWidth = 0, height: imgHeight = 0 } = img ?? {}
            if (minWidth && imgWidth < minWidth) {
              errors.push('IMAGE_MIN_WIDTH')
            }
            if (minHeight && imgHeight < minHeight) {
              errors.push('IMAGE_MIN_HEIGHT')
            }
            if (maxWidth && imgWidth > maxWidth) {
              errors.push('IMAGE_MAX_WIDTH')
            }
            if (maxHeight && imgHeight > maxHeight) {
              errors.push('IMAGE_MAX_HEIGHT')
            }

            if (errors.length) {
              reject({ fileErrors: errors })
            } else {
              resolve(result)
            }
          }
        } else {
          reject({ fileErrors: ['errors.default'] })
        }
      })
    } else if (fileType.includes('vide')) {
      video = document.createElement('video')
      video.src = result.src
      return new Promise((resolve, reject) => {
        if (video) {
          video.addEventListener('loadeddata', (_e) => {
            resolve(result)
          })
        } else {
          reject({ fileErrors: ['errors.default'] })
        }
      })
    }
  } catch (error) {
    errors.push('FILE_TYPE')
  }
  throw { fileErrors: errors || ['errors.default'] }
}
