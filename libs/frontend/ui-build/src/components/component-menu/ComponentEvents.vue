<template>
  <div class="component-events">
    <EditMenuTitle
      :title="t('build.events')"
      @add="
        setEditedEvent({
          name: '',
          behaviors: [{ behaviorId: noBehaviorId }],
        })
      "
    />
    <EventRow
      v-for="entry in events"
      :key="entry.name"
      :event="entry"
      class="menu-row"
      @edit="setEditedEvent(entry)"
    />
  </div>
</template>

<script lang="ts">
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, IComponentEvent, ISite } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

interface IComponentEventWithSource extends IComponentEvent {
  source: ComponentEventSource
}

enum ComponentEventSource {
  Custom,
  Self,
}

const computeComponentEvents = (
  site: ISite,
  component: IComponent,
): Record<string, IComponentEventWithSource> => {
  const mergedEvents: Record<string, IComponentEventWithSource> = {}

  // Append custom component events
  const customCmp = resolveComponent(site.context, component.customSourceId)
  if (customCmp) {
    Object.entries(customCmp.events ?? {}).forEach(([key, event]) => {
      mergedEvents[key] = {
        ...event,
        source: ComponentEventSource.Custom,
      }
    })
  }

  // Append custom events
  Object.entries(component.events ?? {}).forEach(([key, event]) => {
    mergedEvents[key] = {
      ...event,
      source: ComponentEventSource.Self,
    }
  })

  return mergedEvents
}
</script>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useEditComponentEvent } from '@pubstudio/frontend/feature-build'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import EditMenuTitle from '../EditMenuTitle.vue'
import EventRow from './EventRow.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const { site } = useSiteSource()
const { setEditedEvent } = useEditComponentEvent()

const events = computed(() => {
  return Object.values(computeComponentEvents(site.value, component.value))
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-events {
  background-color: $menu-bg2;
  padding: 0 16px;
}
</style>
