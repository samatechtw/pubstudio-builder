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
          <STMultiselect
            :value="data.tag || ''"
            class="tag"
            :placeholder="t('tag')"
            :options="tags"
            @select="updateTag"
          />
        </div>
        <div v-if="data.tag === 'base'" class="meta-row">
          <STInput
            :modelValue="data.meta.href || ''"
            name="href"
            placeholder="href"
            @update:modelValue="update('href', $event)"
          />
          <STInput
            :modelValue="data.meta.target || ''"
            name="target"
            placeholder="target"
            @update:modelValue="update('target', $event)"
          />
        </div>
        <div v-else-if="data.tag === 'title'" class="meta-row">
          <STInput
            :modelValue="data.meta"
            name="title"
            placeholder="title"
            @update:modelValue="update('title', $event)"
          />
        </div>
        <div v-else-if="data.tag === 'link'">
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.href || ''"
              name="href"
              placeholder="href"
              @update:modelValue="update('href', $event)"
            />
            <STInput
              :modelValue="data.meta.rel || ''"
              name="rel"
              placeholder="rel"
              @update:modelValue="update('rel', $event)"
            />
          </div>
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.title || ''"
              name="title"
              placeholder="title"
              @update:modelValue="update('title', $event)"
            />
            <STInput
              :modelValue="data.meta.id || ''"
              name="id"
              placeholder="id"
              @update:modelValue="update('id', $event)"
            />
          </div>
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.sizes || ''"
              name="sizes"
              placeholder="sizes"
              @update:modelValue="update('sizes', $event)"
            />
            <STInput
              :modelValue="data.meta.imagesizes || ''"
              name="imagesizes"
              placeholder="imagesizes"
              @update:modelValue="update('imagesizes', $event)"
            />
          </div>
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.media || ''"
              name="media"
              placeholder="media"
              @update:modelValue="update('media', $event)"
            />
            <STInput
              :modelValue="data.meta.type || ''"
              name="type"
              placeholder="type"
              @update:modelValue="update('type', $event)"
            />
          </div>
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.as || ''"
              name="as"
              placeholder="as"
              @update:modelValue="update('as', $event)"
            />
            <STInput
              :modelValue="data.meta.blocking || ''"
              name="blocking"
              placeholder="blocking"
              @update:modelValue="update('blocking', $event)"
            />
            <STInput
              :modelValue="data.meta.crossorigin || ''"
              name="crossorigin"
              placeholder="crossorigin"
              @update:modelValue="update('crossorigin', $event)"
            />
          </div>
        </div>
        <div v-else-if="data.tag === 'meta'">
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.content || ''"
              name="content"
              placeholder="content"
              @update:modelValue="update('content', $event)"
            />
            <STInput
              :modelValue="data.meta['http-equiv'] || ''"
              name="http-equiv"
              placeholder="http-equiv"
              @update:modelValue="update('http-equiv', $event)"
            />
          </div>
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.name || ''"
              name="name"
              placeholder="name"
              @update:modelValue="update('name', $event)"
            />
            <STInput
              :modelValue="data.meta.property || ''"
              name="property"
              placeholder="property"
              @update:modelValue="update('property', $event)"
            />
          </div>
        </div>
        <div v-else-if="data.tag === 'script'">
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.src || ''"
              name="src"
              placeholder="src"
              @update:modelValue="update('src', $event)"
            />
            <STInput
              :modelValue="data.meta.type || ''"
              name="type"
              placeholder="type"
              @update:modelValue="update('type', $event)"
            />
          </div>
          <div class="meta-row">
            <STInput
              :modelValue="data.meta.async || ''"
              name="async"
              placeholder="async"
              @update:modelValue="update('async', $event)"
            />
            <STInput
              :modelValue="data.meta.crossorigin || ''"
              name="crossorigin"
              placeholder="crossorigin"
              @update:modelValue="update('crossorigin', $event)"
            />
            <STInput
              :modelValue="data.meta.blocking || ''"
              name="blocking"
              placeholder="blocking"
              @update:modelValue="update('blocking', $event)"
            />
            <STInput
              :modelValue="data.meta.id || ''"
              name="id"
              placeholder="id"
              @update:modelValue="update('id', $event)"
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
import { useI18n } from 'petite-vue-i18n'
import { STInput, STMultiselect } from '@samatech/vue-components'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { IHeadObject, IHeadTagStr } from '@pubstudio/shared/type-site'
import { IThemeMetaEditData } from './i-theme-meta-edit-data'

const props = defineProps<{
  editData: IThemeMetaEditData | undefined
  allowBase?: boolean
  allowTitle?: boolean
}>()
const { editData, allowBase, allowTitle } = toRefs(props)
const emit = defineEmits<{
  (e: 'save', data: IThemeMetaEditData): void
  (e: 'cancel'): void
}>()

const data = ref()

const tags = computed(() => {
  const strs: IHeadTagStr[] = ['link', 'meta', 'script']
  if (allowTitle.value && typeof data.value.meta !== 'string') {
    strs.unshift('title')
  }
  if (allowBase.value) {
    strs.unshift('base')
  }
  return strs
})

const copyData = (d: IThemeMetaEditData): IThemeMetaEditData => {
  const copiedMeta = typeof d.meta === 'string' ? d.meta : { ...d.meta }
  return {
    ...d,
    meta: copiedMeta,
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

const updateTag = (tag: IHeadTagStr | undefined) => {
  data.value.tag = tag
  if (tag === 'title') {
    data.value.meta = ''
  } else {
    data.value.meta = {}
  }
}

const update = (key: unknown, value: string) => {
  if (key === 'title') {
    data.value.meta = value
  } else {
    data.value.meta[key as keyof IHeadObject] = value || undefined
  }
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
