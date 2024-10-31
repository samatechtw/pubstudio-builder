import { appendEvent } from '@pubstudio/frontend/data-access-command'
import { makeLanguages } from '@pubstudio/frontend/util-builtin'
import { makeAddComponentData } from '@pubstudio/frontend/util-command-data'
import { setHiddenId, toggleHiddenId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { languageDict } from '@pubstudio/frontend/util-site-translations'
import { CommandType } from '@pubstudio/shared/type-command'
import { ComponentEventType, IComponentEvent, ISite } from '@pubstudio/shared/type-site'
import {
  addComponentToParent,
  getMissingComponentFields,
  pushCommandWithBuiltins,
} from './add-builtin-component'

export const addLanguageSelect = (site: ISite): string | undefined => {
  const languages = makeLanguages({
    defaultLang: 'en',
    languageEntries: Object.keys(site.context.i18n)
      .map((lang) => [lang, languageDict[lang]])
      .filter((entries) => !!entries[1]),
  })

  const data = addComponentToParent(site, { id: languages.id }, (parent) =>
    makeAddComponentData(languages, parent, site.editor?.selectedComponent?.id),
  )
  if (data) {
    const missing = getMissingComponentFields(languages)
    pushCommandWithBuiltins(site, CommandType.AddComponent, data, missing)

    const langWrap = resolveComponent(site.context, data.id)
    if (langWrap) {
      const langOptions = langWrap.children?.[1]
      // Toggle language options
      const toggleEvent: IComponentEvent = {
        name: ComponentEventType.Click,
        eventParams: {},
        behaviors: [{ behaviorId: toggleHiddenId, args: { id: langOptions?.id } }],
      }
      // Hide language options
      const hideEvent: IComponentEvent = {
        name: ComponentEventType.ClickOutside,
        eventParams: {},
        behaviors: [
          { behaviorId: setHiddenId, args: { id: langOptions?.id, hide: false } },
        ],
      }
      appendEvent(site, langWrap, toggleEvent, false)
      appendEvent(site, langWrap, hideEvent, true)
    }
  }
  return data?.id
}
