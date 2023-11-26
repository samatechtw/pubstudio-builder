import {
  fallbackWithLocaleChain,
  registerLocaleFallbacker,
  registerMessageResolver,
  resolveValue,
} from '@intlify/core-base'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { createI18n } from 'petite-vue-i18n'
import webEn from './translations/en.json'

type MessageSchema = typeof webEn

// register message resolver of vue-i18n
registerMessageResolver(resolveValue)

// register locale fallbacker of vue-i18n
registerLocaleFallbacker(fallbackWithLocaleChain)

export default createI18n<[MessageSchema], 'en'>({
  legacy: false,
  locale: store.misc.locale.value || 'en',
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  fallbackRoot: true,
  messages: { en: webEn },
})
