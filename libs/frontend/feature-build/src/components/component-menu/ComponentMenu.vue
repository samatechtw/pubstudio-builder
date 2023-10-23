<template>
  <div class="component-menu">
    <ComponentInputEdit
      v-if="isEditingInput"
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
    <div v-else>
      <ComponentTabInfo :component="component" />
      <ComponentTag :tag="component.tag" @setTag="setTag" />
      <ComponentRole :role="component.role" @setRole="setRole" />
      <ComponentTabStyle :component="component" />
      <ComponentInputs
        :component="component"
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
        <PSButton class="debug-button" :text="t('debug')" @click="debugComponent" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { PSButton } from '@pubstudio/frontend/ui-widgets'
import { IComponent } from '@pubstudio/shared/type-site'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { Tag, AriaRole } from '@pubstudio/shared/type-site'
import ComponentTabInfo from './ComponentTabInfo.vue'
import ComponentTabStyle from './ComponentTabStyle.vue'
import { useBuild } from '../../lib/use-build'
import { useEditComponentInput } from '../../lib/use-edit-component-input'
import { useEditComponentEvent } from '../../lib/use-edit-component-event'
import ComponentInputEdit from './ComponentInputEdit.vue'
import ComponentTag from './ComponentTag.vue'
import ComponentRole from './ComponentRole.vue'
import ComponentInputs from './ComponentInputs.vue'
import ComponentEvents from './ComponentEvents.vue'
import ComponentEventEdit from './ComponentEventEdit.vue'

const { t } = useI18n()
const { editor, editComponent } = useBuild()

const props = defineProps<{
  component: IComponent
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
    console.log(editor.value.selectedComponent)
  }
}

const setTag = (value: Tag) => {
  editComponent({ tag: value })
}

const setRole = (value: AriaRole) => {
  editComponent({ role: value })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.actions {
  display: flex;
  align-items: flex-end;
  margin-top: 40px;
}
</style>
