import { assign, isNumber, isObject, isString } from '@intlify/shared'
import { useI18n } from 'petite-vue-i18n'
import { defineComponent, h } from 'vue'

import type { VNodeChild } from 'vue'
import type { TranslateOptions } from '@intlify/core-base'

/**
 * Translation Component Props
 *
 * @VueI18nComponent
 */
export interface TranslationProps {
  /**
   * @remarks
   * Used to wrap the content that is distribute in the slot. If omitted, the slot content is treated as Fragments.
   *
   * You can specify a string-based tag name, such as `p`, or the object for which the component is defined.
   */
  tag?: string | object
  /**
   * @remarks
   * The locale message key can be specified prop
   */
  keypath: string
  /**
   * @remarks
   * The Plural Choosing the message number prop
   */
  plural?: number | string
}

export const I18nT = /*#__PURE__*/ defineComponent({
  name: 'i18n-t',
  props: {
    keypath: {
      type: String,
      required: true,
    },
    plural: {
      type: [Number, String],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (val: any): boolean => isNumber(val) || !isNaN(val),
    },
    tag: {
      type: [String, Object],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: any, { slots, attrs }): any {
    // NOTE: avoid https://github.com/microsoft/rushstack/issues/1050
    const i18n = useI18n()

    return (): VNodeChild => {
      const options = {} as TranslateOptions
      if (props.plural !== undefined) {
        options.plural = isString(props.plural) ? +props.plural : props.plural
      }
      const text = i18n.t(props.keypath).split(/<>/)

      const children = [text[0], slots.default?.() ?? '', text[1] ?? '']
      const assignedAttrs = assign({}, attrs)
      const tag = isString(props.tag) || isObject(props.tag) ? props.tag : 'span'
      return h(tag, assignedAttrs, children)
    }
  },
})
