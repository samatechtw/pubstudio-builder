<template>
  <div class="component-menu">
    <StyleMenuEdit v-if="editingStyle" class="style-edit" />
    <ComponentInputEdit
      v-else-if="isEditingInput"
      :editInput="editedInput"
      @save="upsertInput($event)"
      @remove="removeInput($event)"
      @cancel="setEditedInput(undefined)"
    />
    <ComponentEventEdit
      v-else-if="isEditingEvent"
      :editedEvent="editedEvent"
      :usedEvents="usedEvents"
      @save="upsertEvent"
      @remove="removeEvent"
      @cancel="setEditedEvent(undefined)"
    />
    <template v-else>
      <ComponentTabInfo :component="component" />
      <ComponentDimensions />
      <ComponentTabStyle :component="component" />
      <ComponentInputs
        :component="component"
        :siteId="siteId"
        @setInput="setInputIs($event)"
        @showEditInput="setEditedInput($event)"
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
          class="debug-button"
          size="small"
          :text="t('debug')"
          @click="debugComponent"
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
import { IComponent } from '@pubstudio/shared/type-site'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import ComponentTabInfo from './ComponentTabInfo.vue'
import ComponentDimensions from './ComponentDimensions.vue'
import ComponentTabStyle from './ComponentTabStyle.vue'
import {
  useBuild,
  useEditComponentInput,
  useEditComponentEvent,
  useReusableStyleMenu,
} from '@pubstudio/frontend/feature-build'
import ComponentInputEdit from './ComponentInputEdit.vue'
import ComponentInputs from './ComponentInputs.vue'
import ComponentEvents from './ComponentEvents.vue'
import ComponentEventEdit from './ComponentEventEdit.vue'
import StyleMenuEdit from '../StyleMenuEdit.vue'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { useHUD } from '@pubstudio/frontend/util-ui-alert'

const { t } = useI18n()
const { editor, replacePageRoot } = useBuild()
const { editing: editingStyle } = useReusableStyleMenu()
const { addHUD } = useHUD()

const props = defineProps<{
  component: IComponent
  siteId: string
}>()
const { component } = toRefs(props)

const {
  isEditingInput,
  editedInput,
  setEditedInput,
  upsertInput,
  removeInput,
  setInputIs,
} = useEditComponentInput()

const { isEditingEvent, editedEvent, setEditedEvent, upsertEvent, removeEvent } =
  useEditComponentEvent()

// The name of used events in this component
const usedEvents = computed(
  () => new Set<string>(Object.keys(component.value.events ?? {})),
)

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
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-menu {
  background-color: $menu-bg1;
}

.actions {
  display: flex;
  align-items: flex-end;
  margin-top: 40px;
  padding: 0 16px;
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
