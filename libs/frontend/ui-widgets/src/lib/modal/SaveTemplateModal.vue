<template>
  <Modal :show="!!template" cls="save-template-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('template.save_title') }}
    </div>
    <div class="modal-text">
      {{ t('template.save_text') }}
    </div>
    <div class="save-data-wrap">
      <PSSpinner
        v-if="listLoading"
        :scale="4"
        color="#2a17d6"
        class="save-template-spinner"
      />
      <div class="save-data" :class="{ loading: listLoading }">
        <div class="save-data-input">
          <PSInput
            v-model="name"
            name="name"
            class="template-name"
            :placeholder="t('name')"
          />
          <PSMultiselect
            v-if="templates"
            :value="selectedTemplate?.id"
            class="update-template"
            :placeholder="t('new')"
            labelKey="name"
            valueKey="id"
            :options="templates.results"
            :clearable="true"
            @select="setTemplateId"
          />
        </div>
        <textarea
          v-model="description"
          class="save-data-description"
          :placeholder="t('description')"
          rows="8"
        />
      </div>
    </div>
    <ErrorMessage :error="templateError ? t(templateError) : undefined" />
    <div class="modal-buttons">
      <PSButton
        class="save-button"
        :text="t('save')"
        :disabled="listLoading || !name || !description"
        :animate="saving"
        @click="save"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        variant="secondary"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useTemplate } from '@pubstudio/frontend/feature-template'
import {
  GLOBAL_TEMPLATE_COLLECTION_ID,
  ITemplateViewModel,
} from '@pubstudio/shared/type-api-platform-template'
import { ISerializedSite } from '@pubstudio/shared/type-site'
import { ICreatePlatformTemplateRequest } from '@pubstudio/shared/type-api-platform-template'
import Modal from './Modal.vue'
import PSInput from '../form/PSInput.vue'
import PSButton from '../form/PSButton.vue'
import PSSpinner from '../PSSpinner.vue'
import PSMultiselect from '../form/PSMultiselect.vue'
import ErrorMessage from '../ErrorMessage.vue'

const { t } = useI18n()
const {
  templates,
  saving,
  templateError,
  listLoading,
  listTemplates,
  createTemplate,
  updateTemplate,
} = useTemplate()

const props = defineProps<{
  template: ISerializedSite | undefined
}>()
const { template } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const name = ref('')
const description = ref('')
const selectedTemplate = ref<ITemplateViewModel | undefined>()

const setTemplateId = (newTemplate: ITemplateViewModel | undefined) => {
  if (
    !name.value ||
    name.value === selectedTemplate.value?.name ||
    name.value === template.value?.name
  ) {
    name.value = newTemplate?.name ?? ''
  }
  if (!description.value || description.value === selectedTemplate.value?.description) {
    description.value = newTemplate?.description ?? ''
  }
  selectedTemplate.value = newTemplate
}

const save = async () => {
  const { context, defaults, pages } = template.value ?? {}
  if (!context || !defaults || !pages) {
    return
  }
  const payload = {
    description: description.value,
    public: true,
    name: name.value,
    version: '0.1',
    context,
    defaults,
    pages,
  }
  if (selectedTemplate.value) {
    await updateTemplate(selectedTemplate.value.id, payload)
  } else {
    const data = payload as ICreatePlatformTemplateRequest
    data.collection_id = GLOBAL_TEMPLATE_COLLECTION_ID
    await createTemplate(data)
  }
  if (!templateError.value) {
    emit('cancel')
  }
}

watch(template, async (template: ISerializedSite | undefined) => {
  if (template) {
    name.value = template.name || ''
    await listTemplates()
    selectedTemplate.value = templates.value?.results.find(
      (t) => t.name === template.name,
    )
    description.value = selectedTemplate.value?.description ?? ''
  }
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.save-template-modal {
  .save-data-wrap {
    @mixin flex-center;
  }
  .save-template-spinner {
    position: absolute;
  }
  .save-data-input {
    display: flex;
  }
  .save-data {
    width: 100%;
    margin-top: 16px;
    &.loading {
      visibility: hidden;
    }
  }
  .save-data-description {
    margin-top: 16px;
    width: 100%;
  }
  .template-name {
    width: 50%;
    .ps-input {
      height: 38px;
    }
  }
  .update-template {
    width: 50%;
    margin-left: 8px;
  }
  .modal-buttons {
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
    .modal-text {
      margin: 24px 0;
    }
  }
}
</style>
