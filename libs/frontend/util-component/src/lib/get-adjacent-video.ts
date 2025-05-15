import { IComponent, Tag } from '@pubstudio/shared/type-site'

// Gets a video component near the current component.
// Return if:
//  Component is video
//  Component is source and parent component is video
//  Child is video and component name is video related
export const getAdjacentVideo = (cmp: IComponent | undefined): IComponent | undefined => {
  if (!cmp) {
    return undefined
  }
  if (cmp.tag === Tag.Video) {
    return cmp
  }
  if (cmp.tag === Tag.Source && cmp.parent?.tag === Tag.Video) {
    return cmp.parent
  }
  if (cmp.children?.[0].tag === Tag.Video && cmp.name.includes('ideo')) {
    return cmp.children?.[0]
  }
  return undefined
}
