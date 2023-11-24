<template>
  <PSMultiselect
    :value="value?.toString()"
    :placeholder="t('build.component_id')"
    :options="components"
    :clearable="false"
    class="component-id-arg"
    @select="emit('update:arg', $event as unknown as IUpdateComponentArgPayload)"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { IBehaviorArg, IComponentInput } from '@pubstudio/shared/type-site'
import { useBuild } from '../../lib/use-build'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'

const { t } = useI18n()
const { site } = useBuild()

const emit = defineEmits<{
  (e: 'update:arg', payload: IUpdateComponentArgPayload): void
}>()
defineProps<{
  arg: IComponentInput | IBehaviorArg
  value: unknown
}>()

const components = computed(() => {
  return Object.keys(site.value.context.components)
})
</script>
