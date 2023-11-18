<template>
  <div class="component-events">
    <EditMenuTitle :title="t('build.events')" @add="emit('new')" />
    <EventRow
      v-for="entry in events"
      :key="entry.name"
      :event="entry"
      class="menu-row"
      @edit="emit('edit', entry)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { IComponent, IComponentEvent } from '@pubstudio/shared/type-site'
import EditMenuTitle from '../EditMenuTitle.vue'
import EventRow from './EventRow.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const emit = defineEmits<{
  (e: 'new'): void
  (e: 'edit', event: IComponentEvent): void
}>()

const { t } = useI18n()

const events = computed(() => {
  return Object.values(component.value.events ?? {})
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-events {
  background-color: $menu-bg2;
  padding: 0 16px;
}
</style>
