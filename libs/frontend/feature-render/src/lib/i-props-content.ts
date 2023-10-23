import { ICustomEvents } from '@pubstudio/shared/type-site'
import { VNode } from 'vue'

export type IBuildContent = (VNode | string | undefined)[] | undefined
export type IContent = string | IBuildContent

// Native event handlers are included in props, while non-native (custom) event handlers
// are passed as a separate object because Vue components do not recognize the
// keys of non-native events in props, so binding them to the component leads
// to something like `<div clickoutside="(e) => { CODE_HERE }">` in the output HTML.
export type IPropsContent = {
  content: IContent
  props: Record<string, unknown>
  customEventHandlers: ICustomEvents
}

export type IPropsBuildContent = {
  content: IBuildContent
  props: Record<string, unknown>
  customEventHandlers: ICustomEvents
}
