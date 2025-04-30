<template>
  <div class="event-row">
    <div class="label">
      {{ event.name }}
    </div>
    <div class="value-preview">
      {{ resolvedBehaviorNames }}
    </div>
    <Settings class="edit-item" @click="emit('edit')" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IComponentEvent } from '@pubstudio/shared/type-site'
import { Settings } from '@pubstudio/frontend/ui-widgets'
import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()

const props = defineProps<{
  event: IComponentEvent
}>()
const { event } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const { site } = useSiteSource()

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
  font-size: 13px;
  padding: 4px 0 3px;
}

.label {
  padding-left: 6px;
}
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
</style>
