<template>
  <div class="behavior-row">
    <div class="menu-row">
      <div class="label">
        <PSMultiselect
          :value="eventBehavior.behavior.name"
          :placeholder="t('build.behavior')"
          :options="behaviorOptions"
          labelKey="name"
          valueKey="name"
          :searchable="true"
          :clearable="false"
          class="behavior"
          @select="emit('update:behavior', $event)"
          @click.stop
        />
      </div>
      <div v-if="!eventBehavior.behavior.builtin" class="item">
        <Edit class="edit-icon" @click.stop="emit('editBehavior')" />
      </div>
      <div class="item">
        <Minus class="item-delete" @click.stop="emit('remove')" />
      </div>
    </div>
    <div v-if="behaviorArgs.length" class="behavior-args">
      <div class="menu-subtitle args-title">
        {{ t('build.behavior_args') }}
      </div>
      <ComponentArgRow
        v-for="arg in behaviorArgs"
        :key="arg.name"
        :arg="arg"
        :value="eventBehavior.args?.[arg.name]"
        @update:arg="emit('update:customArg', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { IBehavior } from '@pubstudio/shared/type-site'
import { Edit, Minus, PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import ComponentArgRow from '../component-arg/ComponentArgRow.vue'
import { IUpdateComponentArgPayload } from '../component-arg/i-update-component-arg-payload'
import { IResolvedComponentEventBehavior } from './ComponentEventEdit.vue'

const props = defineProps<{
  eventBehavior: IResolvedComponentEventBehavior
  behaviorOptions: IBehavior[]
}>()
const { eventBehavior } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:behavior', behavior: IBehavior): void
  (e: 'update:customArg', payload: IUpdateComponentArgPayload): void
  (e: 'remove'): void
  (e: 'editBehavior'): void
}>()

const { t } = useI18n()

const behaviorArgs = computed(() => {
  return Object.values(eventBehavior.value.behavior.args ?? {})
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.behavior-row {
  border-top: 1px solid $grey-300;
  padding-bottom: 12px;
  .args-title {
    font-size: 13px;
  }
  .edit-icon {
    @mixin size 22px;
  }
  .menu-row {
    border: none;
    padding-bottom: 0;
  }
  .label {
    flex-grow: 1;
  }
  .behavior-args {
    margin-top: 16px;
  }
}
</style>
