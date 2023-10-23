<template>
  <Checkbox
    :item="{
      label: '',
      checked: value === true || value === 'true',
    }"
    class="boolean-arg"
    @checked="update"
  />
</template>

<script lang="ts" setup>
import { IBehaviorArg, IComponentInput } from '@pubstudio/shared/type-site'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'
import { toRefs } from 'vue'
import { Checkbox } from '@pubstudio/frontend/ui-widgets'

const props = defineProps<{
  arg: IComponentInput | IBehaviorArg
  value: unknown
}>()
const { arg } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:arg', payload: IUpdateComponentArgPayload): void
}>()

const update = (checked: boolean) => {
  emit('update:arg', { name: arg.value.name, value: checked })
}
</script>

<style lang="postcss" scoped>
.boolean-arg {
  justify-content: flex-end;
}
</style>
