<template>
  <Modal :show="!!editData" cls="meta-edit-modal" @cancel="emit('cancel')">
    <div class="meta-inner">
      <div class="modal-title">
        {{ t('theme.edit_meta') }}
      </div>
      <div class="modal-text">
        {{ t('theme.edit_meta_text') }}
      </div>
      <div v-if="data" class="meta-data">
        <div class="tag-wrap">
          <div class="label">
            {{ t('tag') }}
          </div>
          <PSMultiselect
            :value="data.tag || ''"
            class="tag"
            :placeholder="t('tag')"
            :options="tags"
            @select="data.tag = $event"
          />
        </div>
        <div v-if="data.tag === 'base'" class="meta-row">
          <PSInput
            :modelValue="data.meta.href || ''"
            name="href"
            placeholder="href"
            @update:modelValue="update('href', $event)"
          />
          <PSInput
            :modelValue="data.meta.target || ''"
            name="target"
            placeholder="target"
            @update:modelValue="update('target', $event)"
          />
        </div>
        <div v-if="data.tag === 'link'">
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.href || ''"
              name="href"
              placeholder="href"
              @update:modelValue="update('href', $event)"
            />
            <PSInput
              :modelValue="data.meta.rel || ''"
              name="rel"
              placeholder="rel"
              @update:modelValue="update('rel', $event)"
            />
          </div>
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.title || ''"
              name="title"
              placeholder="title"
              @update:modelValue="update('title', $event)"
            />
            <PSInput
              :modelValue="data.meta.id || ''"
              name="id"
              placeholder="id"
              @update:modelValue="update('id', $event)"
            />
          </div>
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.sizes || ''"
              name="sizes"
              placeholder="sizes"
              @update:modelValue="update('sizes', $event)"
            />
            <PSInput
              :modelValue="data.meta.imagesizes || ''"
              name="imagesizes"
              placeholder="imagesizes"
              @update:modelValue="update('imagesizes', $event)"
            />
          </div>
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.media || ''"
              name="media"
              placeholder="media"
              @update:modelValue="update('media', $event)"
            />
            <PSInput
              :modelValue="data.meta.type || ''"
              name="type"
              placeholder="type"
              @update:modelValue="update('type', $event)"
            />
          </div>
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.as || ''"
              name="as"
              placeholder="as"
              @update:modelValue="update('as', $event)"
            />
            <PSInput
              :modelValue="data.meta.blocking || ''"
              name="blocking"
              placeholder="blocking"
              @update:modelValue="update('blocking', $event)"
            />
            <PSInput
              :modelValue="data.meta.crossorigin || ''"
              name="crossorigin"
              placeholder="crossorigin"
              @update:modelValue="update('crossorigin', $event)"
            />
          </div>
        </div>
        <div v-if="data.tag === 'meta'">
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.content || ''"
              name="content"
              placeholder="content"
              @update:modelValue="update('content', $event)"
            />
            <PSInput
              :modelValue="data.meta['http-equiv'] || ''"
              name="http-equiv"
              placeholder="http-equiv"
              @update:modelValue="update('http-equiv', $event)"
            />
          </div>
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.name || ''"
              name="name"
              placeholder="name"
              @update:modelValue="update('name', $event)"
            />
            <PSInput
              :modelValue="data.meta.property || ''"
              name="property"
              placeholder="property"
              @update:modelValue="update('property', $event)"
            />
          </div>
        </div>
        <div v-if="data.tag === 'script'">
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.src || ''"
              name="src"
              placeholder="src"
              @update:modelValue="update('src', $event)"
            />
            <PSInput
              :modelValue="data.meta.type || ''"
              name="type"
              placeholder="type"
              @update:modelValue="update('type', $event)"
            />
          </div>
          <div class="meta-row">
            <PSInput
              :modelValue="data.meta.async || ''"
              name="async"
              placeholder="async"
              @update:modelValue="update('async', $event)"
            />
            <PSInput
              :modelValue="data.meta.blocking || ''"
              name="blocking"
              placeholder="blocking"
              @update:modelValue="update('blocking', $event)"
            />
          </div>
        </div>
        <div class="actions">
          <PSButton :text="t('save')" class="submit-button" @click="save" />
          <PSButton :text="t('cancel')" class="cancel-button" @click="emit('cancel')" />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Modal, PSButton, PSInput, PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { IHeadObject } from '@pubstudio/shared/type-site'
import { IThemeMetaEditData } from './i-theme-meta-edit-data'

const props = defineProps<{
  editData: IThemeMetaEditData | undefined
  allowBase?: boolean
}>()
const { editData, allowBase } = toRefs(props)
const emit = defineEmits<{
  (e: 'save', data: IThemeMetaEditData): void
  (e: 'cancel'): void
}>()

const data = ref()

const tags = computed(() => {
  if (allowBase.value) {
    return ['base', 'link', 'meta', 'script']
  } else {
    return ['link', 'meta', 'script']
  }
})

const copyData = (d: IThemeMetaEditData): IThemeMetaEditData => {
  return {
    ...d,
    meta: { ...d.meta },
  }
}

watch(editData, (newData) => {
  if (newData) {
    data.value = copyData(newData)
  } else {
    data.value = undefined
  }
})

const { t } = useI18n()

const save = () => {
  emit('save', data.value)
}

const update = (key: unknown, value: string) => {
  data.value.meta[key as keyof IHeadObject] = value || undefined
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.meta-inner {
  color: $color-text;
}
.modal-text {
  @mixin text 15px;
}
.meta-data {
  margin-top: 12px;
}
.tag-wrap {
  display: flex;
  align-items: center;
}
.label {
  @mixin title-medium 14px;
  margin-right: 8px;
}
.meta-row {
  display: flex;
  margin-top: 8px;
  width: 100%;
  > div:not(:first-child) {
    margin-left: 8px;
  }
  > div {
    flex-grow: 1;
  }
}
.actions {
  margin-top: 24px;
}
.cancel-button {
  margin-left: 8px;
}
</style>
