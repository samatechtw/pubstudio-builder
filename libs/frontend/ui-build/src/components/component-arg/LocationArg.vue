<template>
  <STMultiselect
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
import { STMultiselect } from '@samatech/vue-components'
import { IBehaviorArg, IComponentInput } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'

const { t } = useI18n()
const { site } = useSiteSource()

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
