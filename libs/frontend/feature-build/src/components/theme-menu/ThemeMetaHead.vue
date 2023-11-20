<template>
  <div class="meta-head">
    <div class="name-wrap">
      <div class="name">
        {{ t('theme.head') }}
      </div>
      <Plus class="item-add" @click="showNewMeta" />
    </div>
    <div class="text">
      {{ t('theme.head_text') }}
    </div>
    <ThemeMetaHeadRow
      v-if="'base' in head && head.base"
      tag="base"
      :element="head.base"
      @edit="showEditMeta('base', 0, $event)"
      @remove="removeMeta('base', 0)"
    />
    <ThemeMetaHeadRow
      v-if="'title' in head && head.title"
      tag="title"
      :element="head.title"
      @edit="showEditMeta('title', 0, $event)"
      @remove="removeMeta('title', 0)"
    />
    <ThemeMetaHeadRow
      v-for="(link, index) in head.link"
      :key="`l-${index}`"
      tag="link"
      :element="link"
      @edit="showEditMeta('link', index, $event)"
      @remove="removeMeta('link', index)"
    />
    <ThemeMetaHeadRow
      v-for="(meta, index) in head.meta"
      :key="`m-${index}`"
      tag="meta"
      :element="meta"
      @edit="showEditMeta('meta', index, $event)"
      @remove="removeMeta('meta', index)"
    />
    <ThemeMetaHeadRow
      v-for="(script, index) in head.script"
      :key="`s-${index}`"
      tag="script"
      :element="script"
      @edit="showEditMeta('script', index, $event)"
      @remove="removeMeta('script', index)"
    />
    <ThemeMetaEditModal
      :editData="editMeta || newMeta"
      :allowBase="includeBase"
      :allowTitle="includeTitle"
      @save="saveMeta"
      @cancel="hideMetaModal"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemeMetaHeadRow from './ThemeMetaHeadRow.vue'
import { Plus } from '@pubstudio/frontend/ui-widgets'
import ThemeMetaEditModal from './ThemeMetaEditModal.vue'
import { IHead, IHeadObject, IHeadTagStr, IPageHead } from '@pubstudio/shared/type-site'
import { IThemeMetaEditData } from './i-theme-meta-edit-data'

const { t } = useI18n()

defineProps<{
  head: IHead | IPageHead
  includeBase?: boolean
  includeTitle?: boolean
}>()

const emit = defineEmits<{
  (e: 'add', data: IThemeMetaEditData): void
  (e: 'set', data: IThemeMetaEditData): void
  (e: 'remove', tag: IHeadTagStr, index: number): void
}>()

const editMeta = ref<IThemeMetaEditData>()
const newMeta = ref<IThemeMetaEditData>()

const showNewMeta = () => {
  newMeta.value = {
    tag: 'meta',
    index: 0,
    meta: {},
  }
}

const showEditMeta = (tag: IHeadTagStr, index: number, meta: IHeadObject | string) => {
  editMeta.value = {
    tag,
    index,
    meta,
  }
}

const saveMeta = (data: IThemeMetaEditData) => {
  if (editMeta.value) {
    emit('set', data)
  } else if (newMeta.value) {
    emit('add', data)
  }
  hideMetaModal()
}

const removeMeta = (tag: IHeadTagStr, index: number) => {
  emit('remove', tag, index)
}

const hideMetaModal = () => {
  editMeta.value = undefined
  newMeta.value = undefined
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.name-wrap {
  display: flex;
  margin-top: 16px;
  align-items: center;
}
.item-add {
  margin-left: 8px;
}
.name {
  @mixin title 14px;
}
.text {
  @mixin text 14px;
  margin: 4px 0 12px;
}
</style>
