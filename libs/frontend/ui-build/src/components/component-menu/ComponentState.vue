<template>
  <div class="component-state">
    <EditMenuTitle
      :title="t('state')"
      :collapsed="collapsed"
      :showAdd="editingIndex === undefined"
      @add="newState"
      @toggleCollapse="toggleCollapse"
    />
    <div class="state-rows" :class="{ collapsed }">
      <ComponentStateRow
        v-if="editingIndex === -1"
        :editing="true"
        :stateKey="''"
        :stateVal="''"
        @save="addState"
        @remove="removeState(undefined)"
      />
      <ComponentStateRow
        v-for="([stateKey, stateVal], index) in componentState"
        :key="`state-${stateKey}`"
        :editing="index === editingIndex"
        :stateKey="stateKey"
        :stateVal="stateVal"
        @edit="editingIndex = index"
        @save="setState($event, stateKey)"
        @remove="removeState(stateKey)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { setComponentMenuCollapses } from '@pubstudio/frontend/data-access-command'
import { ComponentMenuCollapsible, IComponent } from '@pubstudio/shared/type-site'
import EditMenuTitle from '../EditMenuTitle.vue'
import ComponentStateRow from './ComponentStateRow.vue'
import {
  addComponentState,
  removeComponentState,
  setComponentState,
} from '@pubstudio/frontend/feature-build'
import { IEditComponentState } from './i-edit-component-state'

const { t } = useI18n()
const { site, editor } = useSiteSource()
const editingIndex = ref<number>()

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const collapsed = computed(
  () => !!editor.value?.componentMenuCollapses?.[ComponentMenuCollapsible.State],
)

const toggleCollapse = () => {
  setComponentMenuCollapses(
    editor.value,
    ComponentMenuCollapsible.State,
    !collapsed.value,
  )
}

const componentState = computed(() => {
  return Object.entries(component.value?.state ?? {}).sort((a, b) =>
    b[0].localeCompare(a[0]),
  )
})

const newState = () => {
  setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.State, false)
  editingIndex.value = -1
}

const addState = (state: IEditComponentState) => {
  editingIndex.value = undefined
  addComponentState(site.value, component.value.id, state.key, state.value)
}

const setState = (state: IEditComponentState, oldKey: string) => {
  editingIndex.value = undefined
  setComponentState(site.value, component.value, oldKey, state.key, state.value)
}

const removeState = (stateKey: string | undefined) => {
  editingIndex.value = undefined
  if (stateKey) {
    removeComponentState(site.value, component.value, stateKey)
  }
}

const stateRowHeight = computed(() => {
  let height = componentState.value.length * 36
  if (editingIndex.value == -1) {
    height += 50
  } else if (editingIndex.value !== undefined) {
    height += 14
  }
  return 42 + height
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-state {
  padding: 0 16px;
  width: 100%;
}
.sub-label {
  cursor: pointer;
  margin: 0 8px 0 0;
}
.state-rows {
  transition: max-height 0.2s;
  overflow: visible;
  max-height: v-bind(stateRowHeight + 'px');
  &.collapsed {
    max-height: 0;
    overflow: hidden;
  }
}
</style>
