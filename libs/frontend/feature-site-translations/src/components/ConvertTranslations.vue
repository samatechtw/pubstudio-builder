<template>
  <Modal :show="show" cls="convert-i18n-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('i18n.convert') }}
    </div>
    <div class="modal-text">
      {{ t('i18n.convert_text') }}
    </div>
    <div class="modal-text i18n-warning">
      <img src="@frontend-assets/icon/warning.png" class="warn" />
      <div>{{ t('i18n.convert_alpha') }}</div>
    </div>
    <div v-if="commands" class="convert-lines">
      <span>{{ t('i18n.new_i18n') }}</span>
      <span class="new-translations">{{ translationCount }}</span>
      <span>{{ t('i18n.duplicate') }}</span>
      <span class="duplicates">{{ duplicates }}</span>
    </div>
    <ErrorMessage v-if="error" :error="error" class="convert-error" />
    <div class="modal-buttons">
      <PSButton
        v-if="commands"
        class="confirm-button"
        :text="t('confirm')"
        @click="convertI18n"
      />
      <PSButton v-else class="confirm-button" :text="t('scan')" @click="scanI18n" />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { pushGroupCommands } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { iteratePage } from '@pubstudio/frontend/util-render'
import { clone } from '@pubstudio/frontend/util-component'
import { i18nVarRegex } from '@pubstudio/frontend/feature-render'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IEditComponentData,
  IReplaceTranslationsData,
} from '@pubstudio/shared/type-command-data'

const i18n = useI18n()
const { t } = i18n
const { site } = useSiteSource()

const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const duplicates = ref(0)
const error = ref()
const translationCount = ref(0)
const skipped = ref(0)
const defaultLang = ref('en')
const commands = ref<ICommand[]>()

const clearData = () => {
  error.value = undefined
  duplicates.value = 0
  skipped.value = 0
  translationCount.value = 0
  commands.value = undefined
}

const scanI18n = async () => {
  clearData()
  const newTranslations = clone(site.value.context.i18n)
  const contentMap: Record<string, string> = {}
  const newCommands: ICommand[] = []
  for (const page of Object.values(site.value.pages)) {
    iteratePage(page, (component) => {
      const { content } = component
      if (content) {
        if (i18nVarRegex.test(content) || content.includes('<svg')) {
          skipped.value += 1
          return
        }
        // Strip outer html, but only if there is a single div wrapper
        let parsedContent = content.trim()
        const divCount = (parsedContent.match(/<\/div>/g) || []).length
        if (divCount === 1) {
          parsedContent = parsedContent.replace(/<div.*?>(.*)<\/div>/, '$1')
        }
        if (contentMap[parsedContent]) {
          duplicates.value += 1
        } else {
          translationCount.value += 1
          contentMap[parsedContent] = component.id
        }
        const data: IEditComponentData = {
          id: component.id,
          new: { content: '${' + contentMap[parsedContent] + '}' },
          old: { content: component.content },
        }
        newCommands.push({ type: CommandType.EditComponent, data })
      }
    })
  }
  if (newCommands.length) {
    if (!newTranslations[defaultLang.value]) {
      newTranslations[defaultLang.value] = {}
    }
    for (const [content, componentId] of Object.entries(contentMap)) {
      newTranslations[defaultLang.value][componentId] = content
    }
    const oldTranslations = clone(site.value.context.i18n)
    const data: IReplaceTranslationsData = { oldTranslations, newTranslations }
    newCommands.push({ type: CommandType.ReplaceTranslations, data })

    commands.value = newCommands
  } else {
    error.value = t('errors.no_translations')
  }
}

const convertI18n = async () => {
  if (commands.value && commands.value?.length > 0) {
    pushGroupCommands(site.value, commands.value)
    emit('cancel')
  }
}

watch(show, () => {
  clearData()
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.convert-i18n-modal {
  .modal-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 90%;
    width: 540px;
  }
  .modal-buttons {
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
  }
  .i18n-warning {
    display: flex;
    align-items: center;
  }
  .warn {
    @mixin size 24px;
    margin-right: 8px;
  }
  .convert-wrap {
    display: flex;
    align-items: center;
    margin-top: 16px;
    font-size: 14px;
  }
  .i18n-convert {
    margin-right: 8px;
  }
  .convert-options {
    display: flex;
    margin-top: 12px;
    .checkbox {
      margin: 0 16px 0 0;
    }
  }
  .convert-option {
    display: flex;
    align-items: center;
    .checkbox {
      margin: 0 8px 0 0;
    }
  }
  .convert-lines {
    margin-top: 16px;
  }
  .new-translations {
    font-weight: 700;
    margin: 0 8px 0 4px;
  }
  .duplicates {
    font-weight: 700;
    margin-left: 4px;
  }
  .remove {
    @mixin size 22px;
    margin-left: 8px;
    cursor: pointer;
  }
  .convert-error .error {
    padding-top: 12px;
  }
  .modal-buttons {
    margin-top: 24px;
  }
}
</style>
