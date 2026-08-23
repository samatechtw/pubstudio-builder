<template>
  <div id="component-menu">
    <StyleMenuEdit v-if="isEditingMixin" class="style-edit" />
    <ComponentInputEdit
      v-else-if="isEditingInput"
      :editInput="editedInput"
      @save="upsertInput($event)"
      @remove="removeInput($event)"
      @cancel="setEditedInput(undefined)"
    />
    <ComponentEventEdit v-else-if="isEditingEvent" :component="component" />
    <template v-else>
      <ComponentTabInfo :component="component" />
      <ComponentInstanceChild :component="component" />
      <ToolbarText :show="showTextStyle" />
      <ToolbarContainer />
      <ComponentFlex />
      <ComponentDimensions />
      <ComponentTabStyle :component="component" />
      <ComponentInputs
        :component="component"
        :siteId="siteId"
        @setInput="upsertInput($event)"
        @showEditInput="setEditedInput($event)"
        @removeInput="removeInput($event)"
      />
      <ComponentEvents :component="component" />
      <ComponentEditorEvents :component="component" />
      <ComponentState :component="component" />
      <div class="actions">
        <PSButton
          v-if="isDev"
          class="debug-button"
          size="small"
          :text="t('debug')"
          @click="debugComponent"
        />
        <PSButton
          v-if="showToCustomComponent"
          class="to-custom-button"
          size="small"
          :text="t('build.to_custom')"
          :secondary="true"
          @click="toCustomComponent"
        />
        <PSButton
          v-if="isInstance"
          class="edit-custom-button"
          size="small"
          :text="t('build.edit_custom')"
          :secondary="true"
          @click="editCustomComponent"
        />
        <PSButton
          v-if="isInstance"
          class="detach-custom-button"
          size="small"
          :text="t('build.detach')"
          :secondary="true"
          @click="detach"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSButton } from '@pubstudio/frontend/ui-widgets'
import { prosemirrorEditing } from '@pubstudio/frontend/util-edit-text'
import { BuildSubmenu, ComponentTabState, IComponent } from '@pubstudio/shared/type-site'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { isDev } from '@pubstudio/frontend/util-config'
import ComponentTabInfo from './ComponentTabInfo.vue'
import ComponentInstanceChild from './ComponentInstanceChild.vue'
import ComponentDimensions from './ComponentDimensions.vue'
import ComponentTabStyle from './ComponentTabStyle.vue'
import {
  useBuild,
  useEditComponentInput,
  useMixinMenu,
} from '@pubstudio/frontend/feature-build'
import {
  enterComponentEdit,
  setBuildSubmenu,
} from '@pubstudio/frontend/data-access-command'
import { canBecomeCustom } from '@pubstudio/frontend/util-component'
import ComponentInputEdit from './ComponentInputEdit.vue'
import ComponentInputs from './ComponentInputs.vue'
import ComponentEvents from './ComponentEvents.vue'
import ComponentEditorEvents from './ComponentEditorEvents.vue'
import ComponentEventEdit from './ComponentEventEdit.vue'
import StyleMenuEdit from '../style-menu/StyleMenuEdit.vue'
import ComponentFlex from './ComponentFlex.vue'
import ToolbarContainer from '../toolbar/ToolbarContainer.vue'
import ToolbarText from '../toolbar/ToolbarText.vue'
import ComponentState from './ComponentState.vue'

const { t } = useI18n()
const { site, editor, convertToCustomComponent, detachInstance } = useBuild()
const { isEditingMixin } = useMixinMenu()

const props = defineProps<{
  component: IComponent
  siteId: string
}>()
const { component } = toRefs(props)

const { isEditingInput, editedInput, setEditedInput, upsertInput, removeInput } =
  useEditComponentInput()

const isEditingEvent = computed(() => {
  return editor.value?.componentTab?.state === ComponentTabState.EditEvent
})

const debugComponent = () => {
  if (editor.value?.selectedComponent) {
    const serialized = serializeComponent(editor.value.selectedComponent)
    console.log(site.value.context.nextId, JSON.parse(JSON.stringify(serialized)))
  }
}

const showTextStyle = computed(() => {
  return (
    editor.value?.selectedComponent?.content !== undefined ||
    prosemirrorEditing(editor.value)
  )
})

const showToCustomComponent = computed(() => {
  return canBecomeCustom(site.value.context, component.value.id)
})

const toCustomComponent = () => {
  convertToCustomComponent(component.value)
  setBuildSubmenu(editor.value, BuildSubmenu.Custom)
}

const isInstance = computed(
  () =>
    !!component.value.customSourceId &&
    site.value.context.customComponentIds.has(component.value.customSourceId),
)

const editCustomComponent = () => {
  if (component.value.customSourceId) {
    enterComponentEdit(site.value, component.value.customSourceId)
  }
}

const detach = () => {
  detachInstance(component.value)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

#component-menu {
  background-color: $menu-bg1;
}

.actions {
  display: flex;
  align-items: flex-end;
  padding-top: 24px;
  padding-left: 16px;
  flex-wrap: wrap;
  gap: 8px;
  .to-custom-button {
    margin-left: 8px;
  }
}
.paste-replace-wrap {
  display: flex;
  align-items: center;
  margin-left: 8px;
  .paste-replace-info {
    margin-left: 8px;
  }
}
.style-edit {
  padding: 16px;
}
</style>
