<template>
  <PSMultiselect
    :value="value?.toString()"
    :placeholder="t('build.location')"
    :options="locations"
    :clearable="false"
    class="location-arg"
    @select="select"
  />
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IBehaviorArg, IComponentInput } from '@pubstudio/shared/type-site'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'
import { useBuild } from '../../lib/use-build'

const { t } = useI18n()
const { site } = useBuild()

const props = defineProps<{
  arg: IComponentInput | IBehaviorArg
  value: unknown
}>()
const { arg } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:arg', payload: IUpdateComponentArgPayload): void
}>()

const locations = computed(() => {
  return Object.keys(site.value.pages)
})

const select = (value: string | undefined) => {
  emit('update:arg', { name: arg.value.name, value })
}
</script>
