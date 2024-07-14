import { vueComponentId } from '@pubstudio/frontend/util-ids'
import { Tag } from '@pubstudio/shared/type-site'
import { makeInput } from './helpers'

export const vueComponent = {
  id: vueComponentId,
  name: 'VueComponent',
  tag: Tag.Vue,
  inputs: {
    componentName: makeInput('componentName', '', false),
  },
  style: { custom: {} },
}
