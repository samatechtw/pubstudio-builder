<template>
  <div class="component-event-edit">
    <div class="menu-subtitle menu-row">
      {{ t('build.event') }}
    </div>
    <!-- Event Type -->
    <div class="menu-row">
      <div class="label">
        {{ t('build.event_type') }}
      </div>
      <div class="item">
        <PSMultiselect
          :value="newEvent.name"
          class="event-type"
          :placeholder="t('build.event_type')"
          :options="ComponentEventTypeValues"
          :clearable="false"
          @select="updateEventName"
          @keydown.enter="save"
          @click.stop
        />
      </div>
    </div>
    <!-- Event Params -->
    <div v-if="newEventParams.length" class="event-params">
      <div class="menu-subtitle params-title">
        {{ t('build.event_params') }}
      </div>
      <div class="event-row">
        <MenuRow
          v-for="param in newEventParams"
          :key="param[0]"
          class="arg"
          :label="param[0]"
          :value="(param[1]?.value ?? '').toString()"
          :infoKey="param[1]?.infoKey"
          :htmlInfo="true"
          :forceEdit="true"
          :immediateUpdate="true"
          @update="setEventParam(param[0], $event)"
        >
          <template v-if="param[1].type === ComponentArgPrimitive.Boolean" #input>
            <Checkbox
              class="event-param-checkbox"
              :item="{
                label: '',
                checked: ['true', true].includes(param[1].value),
              }"
              @checked="setEventParam(param[0], $event.toString())"
            />
          </template>
        </MenuRow>
      </div>
    </div>
    <!-- Event Behaviors -->
    <EditMenuTitle :title="t('build.behaviors')">
      <template #add>
        <PSButton
          class="new-behavior-button"
          size="small"
          :text="t('new')"
          @click="showNewBehavior"
        />
      </template>
    </EditMenuTitle>
    <EventBehaviorRow
      v-for="(eventBehavior, i) in newEvent.behaviors"
      :key="i"
      :eventBehavior="eventBehavior"
      :behaviorOptions="behaviorOptions"
      @update:behavior="updateBehavior(eventBehavior, $event)"
      @update:customArg="updateCustomArg(eventBehavior, $event)"
      @remove="removeEventBehavior(i)"
      @editBehavior="showEditBehavior(eventBehavior.behavior)"
    />
    <div className="menu-row add-event-behavior-row">
      <Plus class="add-event-behavior" @click="addEventBehavior" />
    </div>
    <!-- Actions -->
    <ErrorMessage :error="inputError" />
    <div class="event-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        @click.stop="save"
      />
      <PSButton
        v-if="editedEvent"
        class="delete-button"
        :text="t('delete')"
        :secondary="true"
        @click.stop="removeEvent(editedEvent?.name as string)"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="setEditedEvent(undefined)"
      />
    </div>
    <BehaviorModal @saved="setOrAddBehavior" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  IResolvedComponentEvent,
  IResolvedComponentEventBehavior,
  editOrNewEvent,
  useBuild,
  useEditComponentEvent,
} from '@pubstudio/frontend/feature-build'
import {
  Checkbox,
  ErrorMessage,
  PSButton,
  PSMultiselect,
  Plus,
} from '@pubstudio/frontend/ui-widgets'
import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { noBehavior } from '@pubstudio/frontend/feature-builtin'
import { setEditBehavior } from '@pubstudio/frontend/data-access-command'
import {
  ComponentArgPrimitive,
  ComponentEventType,
  ComponentEventTypeValues,
  IBehavior,
  IComponent,
  IComponentEvent,
} from '@pubstudio/shared/type-site'
import MenuRow from '../MenuRow.vue'
import { IUpdateComponentArgPayload } from '../component-arg/i-update-component-arg-payload'
import EditMenuTitle from '../EditMenuTitle.vue'
import EventBehaviorRow from './EventBehaviorRow.vue'
import BehaviorModal from './BehaviorModal.vue'

const { t } = useI18n()
const { site, editor } = useBuild()

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { editedEvent, upsertEvent, removeEvent, setEditedEvent } = useEditComponentEvent()

const newEvent = ref<IResolvedComponentEvent>(
  editOrNewEvent(site.value, editedEvent.value),
)
const inputError = ref()

const addEventBehavior = () => {
  newEvent.value.behaviors.push({
    behavior: noBehavior,
  })
}

// The name of used events in this component
const usedEvents = computed(
  () => new Set<string>(Object.keys(component.value.events ?? {})),
)

const updateEventName = (name: ComponentEventType | undefined) => {
  if (name) {
    newEvent.value.name = name
  }
  // TODO -- is there a cleaner way to make sure events have the correct default args?
  if (name === ComponentEventType.Periodic) {
    if (!newEvent.value.eventParams?.interval) {
      newEvent.value.eventParams = {
        interval: {
          type: ComponentArgPrimitive.Number,
          value: '1000',
        },
      }
    }
  } else if (name === ComponentEventType.ScrollIntoView) {
    newEvent.value.eventParams = {
      margin: {
        type: ComponentArgPrimitive.String,
        value: '0%',
        infoKey: 'build.event_params_info.scroll_into_view.margin',
      },
      direction: {
        type: ComponentArgPrimitive.String,
        value: 'down',
        infoKey: 'build.event_params_info.scroll_into_view.direction',
      },
    }
  } else {
    newEvent.value.eventParams = undefined
  }
}

const newEventParams = computed(() => Object.entries(newEvent.value.eventParams ?? {}))

const setEventParam = (paramName: string, value: string | undefined) => {
  if (newEvent.value.eventParams) {
    newEvent.value.eventParams[paramName].value = value ?? ''
  } else {
    newEvent.value.eventParams = {
      [paramName]: {
        type: ComponentArgPrimitive.String,
        value: value ?? '',
      },
    }
  }
}

// Builtin behaviors + custom behaviors
const behaviorOptions = computed(() => {
  return [
    ...Object.values(site.value.context.behaviors),
    ...Object.values(builtinBehaviors),
  ]
})

const updateBehavior = (
  eventBehavior: IResolvedComponentEventBehavior,
  behavior: IBehavior,
) => {
  eventBehavior.behavior = behavior
}

const updateCustomArg = (
  eventBehavior: IResolvedComponentEventBehavior,
  payload: IUpdateComponentArgPayload,
) => {
  // TODO -- parse/validate value as correct behavior arg type
  const { name, value } = payload
  if (eventBehavior.args) {
    eventBehavior.args[name] = value
  } else {
    eventBehavior.args = { [name]: value }
  }
}

const removeEventBehavior = (index: number) => {
  newEvent.value.behaviors.splice(index, 1)
}

const showNewBehavior = () => {
  setEditBehavior(editor.value, {
    name: '',
  })
}

const showEditBehavior = (behavior: IBehavior) => {
  setEditBehavior(editor.value, site.value.context.behaviors?.[behavior.id])
}

const validateEvent = (): boolean => {
  const newEventName = newEvent.value.name
  if (!newEventName) {
    inputError.value = t('errors.input_name_length')
    return false
  } else if (
    usedEvents.value.has(newEventName) &&
    editedEvent.value?.name !== newEventName
  ) {
    // User is trying to save an event with a name that is already in use
    inputError.value = t('errors.event_type_unique')
    return false
  }
  return true
}

const setOrAddBehavior = (behavior: IBehavior) => {
  if (!behavior) {
    return
  }
  const overrideBehavior = newEvent.value.behaviors.find(
    (b) => b.behavior.id === noBehavior.id,
  )
  if (overrideBehavior) {
    overrideBehavior.behavior = behavior
  } else {
    newEvent.value.behaviors.push({ behavior })
  }
}

const resolvedComponentEventToEvent = (): IComponentEvent => ({
  name: newEvent.value.name,
  eventParams: newEvent.value.eventParams,
  behaviors: newEvent.value.behaviors.map((eventBehavior) => ({
    behaviorId: eventBehavior.behavior.id,
    args: eventBehavior.args,
  })),
})

const save = () => {
  inputError.value = undefined
  if (!validateEvent()) {
    return
  }
  const event = resolvedComponentEventToEvent()
  upsertEvent(event, editedEvent.value?.name)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-event-edit {
  padding: 16px;
  .label,
  .item {
    @mixin text 15px;
    width: 50%;
  }
  .add-event-behavior-row {
    padding: 0 0 12px 0;
    .add-event-behavior {
      @mixin size 26px;
      cursor: pointer;
    }
  }
  .event-params {
    margin-top: 16px;
  }
  .event-param-checkbox {
    margin: 0;
  }
  .event-actions {
    @mixin menu-actions;
    justify-content: space-between;
    > button {
      width: 31%;
      min-width: 31%;
    }
  }
}
</style>
