<template>
  <div class="component-editor-events">
    <EditMenuTitle
      :title="t('build.editor_events')"
      :showAdd="false"
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

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useEditComponentEditorEvent } from '@pubstudio/frontend/feature-build'
import { IComponent } from '@pubstudio/shared/type-site'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import EditMenuTitle from '../EditMenuTitle.vue'
import EventRow from './EventRow.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const { setEditedEvent } = useEditComponentEditorEvent()

const events = computed(() => Object.values(component.value.editorEvents ?? []))
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-editor-events {
  padding: 0 16px;
}
</style>
