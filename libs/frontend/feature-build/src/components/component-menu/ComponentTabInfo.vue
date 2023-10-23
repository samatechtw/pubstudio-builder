<template>
  <div>
    <MenuRowEdit
      :label="t('name')"
      :value="component.name"
      :editable="true"
      :editing="editingName"
      class="name"
      @edit="editName"
      @update="setName"
    />
    <MenuRow :label="t('id')" :value="component.id" :copyValue="true" class="id" />
    <MenuRowEdit
      :label="t('content')"
      :value="component.content"
      :editable="true"
      :editing="editingContent"
      :info="contentInfo"
      class="content"
      :class="{ 'content-hidden': !!contentInfo }"
      @edit="editContent"
      @update="setContent"
    />
    <!-- TODO: children UI
    <div v-if="component.children" class="children">
      <div v-for="child in children" :key="child.id" class="child">
        {{ child.id }}
      </div>
    </div>  -->
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { ComponentTabState, IComponent } from '@pubstudio/shared/type-site'
import {
  setComponentTabState,
  setComponentTabEditInfo,
} from '@pubstudio/frontend/feature-editor'
import MenuRow from '../MenuRow.vue'
import { useBuild } from '../../lib/use-build'
import MenuRowEdit from '../MenuRowEdit.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const { editComponent, editor } = useBuild()

const contentInfo = computed(() => {
  return component.value.children?.length ? t('build.content_info') : undefined
})

const editingContent = computed(() => {
  return editor.value?.componentTab.state === ComponentTabState.EditContent
})

const setContent = (value: string | undefined) => {
  editComponent({ content: value })
  setComponentTabState(editor.value, undefined)
}

const editContent = () => {
  setComponentTabEditInfo(
    editor.value,
    ComponentTabState.EditContent,
    component.value.content,
  )
}

const editingName = computed(() => {
  return editor.value?.componentTab.state === ComponentTabState.EditName
})

const editName = () => {
  setComponentTabEditInfo(editor.value, ComponentTabState.EditName, component.value.name)
}

const setName = (value: string | undefined) => {
  editComponent({ name: value })
  setComponentTabState(editor.value, undefined)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.content-hidden {
  color: $color-disabled;
  :deep(.edit-icon path) {
    stroke: $color-disabled;
  }
}
</style>
