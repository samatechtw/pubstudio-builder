<template>
  <div class="tab-info">
    <MenuRowSimple
      :label="t('name')"
      :value="component.name"
      :editable="true"
      :editing="editingName"
      class="name"
      @edit="editName"
      @update="setName"
    />
    <MenuRow :label="t('id')" :value="component.id" :copyValue="true" class="id" />
    <MenuRowSimple
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
    <div class="tag-role">
      <ComponentTag :tag="component.tag" @setTag="setTag" />
      <ComponentRole :role="component.role" @setRole="setRole" />
    </div>
    <!-- TODO: children UI
    <div v-if="component.children" class="children">
      <div v-for="child in children" :key="child.id" class="child">
        {{ child.id }}
      </div>
    </div>  -->
    <SvgEditModal />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { AriaRole, ComponentTabState, IComponent, Tag } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import {
  setComponentTabState,
  setComponentTabEditInfo,
  setEditSvg,
} from '@pubstudio/frontend/util-command'
import MenuRow from '../MenuRow.vue'
import MenuRowSimple from '../MenuRowSimple.vue'
import ComponentTag from './ComponentTag.vue'
import ComponentRole from './ComponentRole.vue'
import SvgEditModal from './SvgEditModal.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const { editSelectedComponent, editor } = useBuild()

const contentInfo = computed(() => {
  return component.value.children?.length ? t('build.content_info') : undefined
})

const editingContent = computed(() => {
  return editor.value?.componentTab.state === ComponentTabState.EditContent
})

const setContent = (value: string | undefined) => {
  editSelectedComponent({ content: value })
  setComponentTabState(editor.value, undefined)
}

const editContent = () => {
  if (component.value.tag === Tag.Svg) {
    setEditSvg(editor.value, { content: component.value.content ?? '' })
  } else {
    setComponentTabEditInfo(
      editor.value,
      ComponentTabState.EditContent,
      component.value.content,
    )
  }
}

const editingName = computed(() => {
  return editor.value?.componentTab.state === ComponentTabState.EditName
})

const editName = () => {
  setComponentTabEditInfo(editor.value, ComponentTabState.EditName, component.value.name)
}

const setName = (value: string | undefined) => {
  editSelectedComponent({ name: value })
  setComponentTabState(editor.value, undefined)
}

const setTag = (value: Tag | undefined) => {
  editSelectedComponent({ tag: value })
}

const setRole = (value: AriaRole | undefined) => {
  editSelectedComponent({ role: value })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.tab-info {
  padding: 8px 16px 0;
}
.content-hidden {
  color: $color-disabled;
  :deep(.edit-icon path) {
    stroke: $color-disabled;
  }
}
.tag-role {
  display: flex;
  :deep(.ps-multiselect) {
    width: auto;
    flex-grow: 1;
  }
}
</style>
