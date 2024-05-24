<template>
  <div class="component-menu">
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
      <ComponentEvents
        :component="component"
        @new="
          setEditedEvent({
            name: '',
            behaviors: [{ behaviorId: noBehaviorId }],
          })
        "
        @edit="setEditedEvent($event)"
      />
      <div class="actions">
        <PSButton
          v-if="isDev"
          class="debug-button"
          size="small"
          :text="t('debug')"
          @click="debugComponent"
        />
        <PSButton
          v-if="showToReusableComponent"
          class="to-reusable-button"
          size="small"
          :text="t('build.to_reusable')"
          :secondary="true"
          @click="toReusableComponent"
        />
        <div v-if="showPasteReplaceButton" className="paste-replace-wrap">
          <PSButton
            class="paste-replace-button"
            size="small"
            :text="t('build.paste_replace')"
            @click="replaceRootWithCopiedComponent"
          />
          <InfoBubble
            class="paste-replace-info"
            :message="t('build.paste_replace_info')"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSButton, InfoBubble } from '@pubstudio/frontend/ui-widgets'
import { prosemirrorEditing } from '@pubstudio/frontend/util-edit-text'
import { BuildSubmenu, ComponentTabState, IComponent } from '@pubstudio/shared/type-site'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { useHUD } from '@pubstudio/frontend/util-ui-alert'
import { isDev } from '@pubstudio/frontend/util-config'
import ComponentTabInfo from './ComponentTabInfo.vue'
import ComponentDimensions from './ComponentDimensions.vue'
import ComponentTabStyle from './ComponentTabStyle.vue'
import {
  useBuild,
  useEditComponentInput,
  useEditComponentEvent,
  useMixinMenu,
} from '@pubstudio/frontend/feature-build'
import { setBuildSubmenu } from '@pubstudio/frontend/data-access-command'
import ComponentInputEdit from './ComponentInputEdit.vue'
import ComponentInputs from './ComponentInputs.vue'
import ComponentEvents from './ComponentEvents.vue'
import ComponentEventEdit from './ComponentEventEdit.vue'
import StyleMenuEdit from '../style-menu/StyleMenuEdit.vue'
import ComponentFlex from './ComponentFlex.vue'
import ToolbarContainer from '../toolbar/ToolbarContainer.vue'
import ToolbarText from '../toolbar/ToolbarText.vue'

const { t } = useI18n()
const { editor, replacePageRoot, addReusableComponent } = useBuild()
const { isEditingMixin } = useMixinMenu()
const { addHUD } = useHUD()

const props = defineProps<{
  component: IComponent
  siteId: string
}>()
const { component } = toRefs(props)

const { isEditingInput, editedInput, setEditedInput, upsertInput, removeInput } =
  useEditComponentInput()

const { setEditedEvent } = useEditComponentEvent()

const isEditingEvent = computed(() => {
  return editor.value?.componentTab?.state === ComponentTabState.EditEvent
})

const debugComponent = () => {
  if (editor.value?.selectedComponent) {
    const serialized = serializeComponent(editor.value.selectedComponent)
    console.log(JSON.parse(JSON.stringify(serialized)))
  }
}

const showPasteReplaceButton = computed(() => {
  const { selectedComponent, copiedComponent } = editor.value ?? {}
  return (
    !!selectedComponent &&
    !selectedComponent.parent &&
    copiedComponent &&
    selectedComponent.id !== copiedComponent.id
  )
})

const replaceRootWithCopiedComponent = () => {
  const { active, copiedComponent } = editor.value ?? {}
  if (active && copiedComponent && editor.value) {
    replacePageRoot(copiedComponent.id, active)
    addHUD({ text: t('build.replaced') })
    editor.value.copiedComponent = undefined
  }
}

const showTextStyle = computed(() => {
  return (
    editor.value?.selectedComponent?.content !== undefined ||
    prosemirrorEditing(editor.value)
  )
})

const isReusable = (id: string) => {
  return (
    editor.value?.reusableComponentIds.has(id) || editor.value?.reusableChildIds.has(id)
  )
}

const showToReusableComponent = computed(() => {
  const { reusableSourceId, id } = component.value
  let parent: IComponent | undefined = component.value

  if (!parent || reusableSourceId || isReusable(id)) {
    return false
  }
  while (parent) {
    if (parent.reusableSourceId || isReusable(parent.id)) return false
    parent = parent.parent
  }
  return true
})

const toReusableComponent = () => {
  addReusableComponent(component.value)
  setBuildSubmenu(editor.value, BuildSubmenu.Reusable)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-menu {
  background-color: $menu-bg1;
}

.actions {
  display: flex;
  align-items: flex-end;
  margin-top: 24px;
  padding-left: 16px;
  .to-reusable-button {
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
