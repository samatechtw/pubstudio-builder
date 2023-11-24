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
        />
      </div>
    </div>
    <!-- Event Behaviors -->
    <EditMenuTitle :title="t('build.behaviors')" @add="addEventBehavior" />
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
        @click.stop="emit('remove', editedEvent?.name as string)"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="emit('cancel')"
      />
    </div>
    <BehaviorModal />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import {
  ComponentEventType,
  ComponentEventTypeValues,
  IBehavior,
  IComponentEvent,
  IComponentEventBehavior,
} from '@pubstudio/shared/type-site'
import { setEditBehavior } from '@pubstudio/frontend/feature-editor'
import EditMenuTitle from '../EditMenuTitle.vue'
import EventBehaviorRow from './EventBehaviorRow.vue'
import { useBuild } from '../../lib/use-build'
import { IUpdateComponentArgPayload } from '../component-arg/i-update-component-arg-payload'
import BehaviorModal from './BehaviorModal.vue'

export interface IResolvedComponentEvent extends Omit<IComponentEvent, 'behaviors'> {
  behaviors: IResolvedComponentEventBehavior[]
}

export interface IResolvedComponentEventBehavior
  extends Omit<IComponentEventBehavior, 'behaviorId'> {
  behavior: IBehavior
}

const { site, editor } = useBuild()

export const defaultEvent = (): IResolvedComponentEvent => ({
  name: ComponentEventType.Click,
  behaviors: [
    {
      behavior: noBehavior,
    },
  ],
})

const editOrNewEvent = (
  editedEvent: IComponentEvent | undefined,
): IResolvedComponentEvent => {
  if (!editedEvent) {
    return defaultEvent()
  }

  // We can't reuse `resolvedBehavior` here because of race condition.
  const eventBehaviors: IResolvedComponentEventBehavior[] = []

  editedEvent.behaviors.forEach((eventBehavior) => {
    const behavior = resolveBehavior(site.value.context, eventBehavior.behaviorId)
    if (behavior) {
      eventBehaviors.push({
        args: eventBehavior.args,
        behavior,
      })
    }
  })

  if (!eventBehaviors.length) {
    return defaultEvent()
  }

  return {
    name: editedEvent.name,
    eventParams: editedEvent.eventParams ? { ...editedEvent.eventParams } : undefined,
    behaviors: eventBehaviors,
  }
}
</script>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton, PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { resolveBehavior } from '@pubstudio/frontend/util-builtin'
import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { noBehavior } from '@pubstudio/frontend/feature-builtin'
import MenuRow from '../MenuRow.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    editedEvent: IComponentEvent | undefined
    usedEvents: Set<string>
  }>(),
  {
    editedEvent: undefined,
  },
)
const { editedEvent, usedEvents } = toRefs(props)

const emit = defineEmits<{
  (e: 'save', event: IComponentEvent, oldEventName?: string): void
  (e: 'remove', name: string): void
  (e: 'cancel'): void
}>()

const newEvent = ref<IResolvedComponentEvent>(editOrNewEvent(editedEvent.value))
const inputError = ref()

const addEventBehavior = () => {
  newEvent.value.behaviors.push({
    behavior: noBehavior,
  })
}

const updateEventName = (name: ComponentEventType | undefined) => {
  if (name) {
    newEvent.value.name = name
  }
  // TODO -- is there a cleaner way to make sure events have the correct default args?
  if (name === ComponentEventType.Periodic) {
    if (!newEvent.value.eventParams?.interval) {
      newEvent.value.eventParams = {
        interval: {
          value: '1000',
        },
      }
    }
  } else if (name === ComponentEventType.ScrollIntoView) {
    if (newEvent.value.eventParams?.interval === undefined) {
      newEvent.value.eventParams = {
        margin: {
          value: '0%',
          infoKey: 'build.event_params_info.scroll_into_view.margin',
        },
        direction: {
          value: 'down',
          infoKey: 'build.event_params_info.scroll_into_view.direction',
        },
      }
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
  emit('save', resolvedComponentEventToEvent(), editedEvent.value?.name)
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
  .event-params {
    margin-top: 16px;
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
