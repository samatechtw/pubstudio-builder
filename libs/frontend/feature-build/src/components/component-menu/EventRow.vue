<template>
  <div class="event-row menu-row">
    <div class="label">
      {{ event.name }}
    </div>
    <div class="item">
      <div class="value-preview">
        {{ resolvedBehaviorNames }}
      </div>
      <Settings class="edit-item" @click="emit('edit')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { IComponentEvent } from '@pubstudio/shared/type-site'
import { Settings } from '@pubstudio/frontend/ui-widgets'
import { resolveBehavior } from '@pubstudio/frontend/util-builtin'
import { useBuild } from '../../lib/use-build'

const { t } = useI18n()

const props = defineProps<{
  event: IComponentEvent
}>()
const { event } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const { site } = useBuild()

const resolvedBehaviorNames = computed(() => {
  const names: string[] = []
  event.value.behaviors.forEach((eventBehavior) => {
    const resolvedBehavior = resolveBehavior(site.value.context, eventBehavior.behaviorId)
    if (resolvedBehavior) {
      names.push(resolvedBehavior.name)
    }
  })
  return names.join(', ') || t('build.no_behaviors')
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.event-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  font-size: 14px;
}

.label {
  width: 50%;
  padding-left: 16px;
}

.item {
  width: 50%;
  display: flex;
  align-items: center;
  margin-left: auto;
  .value-preview {
    @mixin truncate;
    margin-left: auto;
    margin-right: 8px;
    color: $grey-500;
  }
  .edit-item {
    width: 20px;
    flex-shrink: 0;
  }
}
</style>
