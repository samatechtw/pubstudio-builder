<template>
  <div class="component-events">
    <EditMenuTitle :title="t('build.events')" @add="emit('new')" />
    <EventRow
      v-for="entry in events"
      :key="entry.name"
      :event="entry"
      class="menu-row"
      @edit="emit('edit', entry)"
      @reset="emit('reset', entry.name)"
    />
  </div>
</template>

<script lang="ts">
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, IComponentEvent, ISite } from '@pubstudio/shared/type-site'

interface IComponentEventWithSource extends IComponentEvent {
  source: ComponentEventSource
}

enum ComponentEventSource {
  Reusable,
  Custom,
}

const computeComponentEvents = (
  site: ISite,
  component: IComponent,
): Record<string, IComponentEventWithSource> => {
  const mergedEvents: Record<string, IComponentEventWithSource> = {}

  // Append reusable component inputs
  const reusableCmp = resolveComponent(site.context, component.reusableSourceId)
  if (reusableCmp) {
    Object.entries(reusableCmp.events ?? {}).forEach(([key, event]) => {
      mergedEvents[key] = {
        ...event,
        source: ComponentEventSource.Reusable,
      }
    })
  }

  // Append custom inputs
  Object.entries(component.events ?? {}).forEach(([key, event]) => {
    mergedEvents[key] = {
      ...event,
      source: ComponentEventSource.Custom,
    }
  })

  return mergedEvents
}
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import EditMenuTitle from '../EditMenuTitle.vue'
import EventRow from './EventRow.vue'
import { useBuild } from '@pubstudio/frontend/feature-build'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const emit = defineEmits<{
  (e: 'new'): void
  (e: 'edit', event: IComponentEvent): void
}>()

const { t } = useI18n()

const { site } = useBuild()

const events = computed(() =>
  Object.values(computeComponentEvents(site.value, component.value)),
)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-events {
  background-color: $menu-bg2;
  padding: 0 16px;
}
</style>
