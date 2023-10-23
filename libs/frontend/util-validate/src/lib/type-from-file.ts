import { EnumFileFormat } from '@samatech/image-api-types'

export const typeFromFile = (file: File): EnumFileFormat | undefined => {
  let typeStr: string | undefined
  const mimeArr = file.type.split('/')
  if (mimeArr.length > 1) {
    typeStr = mimeArr[1]
  }
  if (!typeStr) {
    const nameArr = file.name.split('.')
    if (nameArr.length > 1) {
      typeStr = nameArr[nameArr.length - 1]
    }
  }
  if (typeStr === 'jpg' || typeStr === 'jpeg') {
    return EnumFileFormat.jpg
  } else if (typeStr === 'png') {
    return EnumFileFormat.png
  } else if (typeStr === 'webp') {
    return EnumFileFormat.webp
  }
  return undefined
}
