import { defaultContext } from '@pubstudio/frontend/util-ids'

export interface IParsedId {
  namespace?: string
  id: string
}
export const parseId = (id: string): IParsedId => {
  const idArr = id.split('-')
  if (idArr.length === 3) {
    return { namespace: idArr[0], id: idArr[2] }
  }
  return { id: idArr[1] }
}

export const isGlobal = (id: string | undefined): boolean => {
  return (id ?? '').startsWith(defaultContext.namespace)
}
