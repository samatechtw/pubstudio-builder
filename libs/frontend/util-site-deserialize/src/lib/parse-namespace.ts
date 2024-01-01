export const parseNamespace = (id: string | undefined): string | undefined => {
  if (!id) {
    return undefined
  }
  const parts = id.split('-')
  if (parts.length <= 2) {
    return undefined
  }
  return parts.slice(0, parts.length - 2).join('-')
}
