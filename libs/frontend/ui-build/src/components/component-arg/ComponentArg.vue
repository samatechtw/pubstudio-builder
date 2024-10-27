<template>
  <div class="arg">
    <LocationArg
      v-if="isLocation"
      :arg="arg"
      :value="value"
      class="item"
      @update:arg="emit('update:arg', $event)"
    />
    <ArrayArg
      v-else-if="isArray"
      :arg="arg"
      :value="value"
      class="item"
      @update:arg="emit('update:arg', $event)"
    />
    <ComponentIdArg
      v-else-if="isComponent"
      :arg="arg"
      :value="value"
      class="item"
      @update:arg="emit('update:arg', $event)"
    />
    <BooleanArg
      v-else-if="isBoolean"
      :arg="arg"
      :value="value"
      class="item"
      @update:arg="emit('update:arg', $event)"
    />
    <STInput
      v-else
      :modelValue="(value ?? '').toString()"
      class="item"
      @update:modelValue="update"
      @keydown.enter="update"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { STInput } from '@samatech/vue-components'
import {
  ComponentArgPrimitive,
  IBehaviorArg,
  IComponentInput,
} from '@pubstudio/shared/type-site'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'
import LocationArg from './LocationArg.vue'
import ArrayArg from './ArrayArg.vue'
import ComponentIdArg from './ComponentIdArg.vue'
import BooleanArg from './BooleanArg.vue'

const emit = defineEmits<{
  (e: 'update:arg', payload: IUpdateComponentArgPayload): void
}>()
const props = defineProps<{
  arg: IComponentInput | IBehaviorArg
  value: unknown
}>()
const { arg, value } = toRefs(props)

const isLocation = computed(() => {
  return arg.value.type === ComponentArgPrimitive.Location
})
const isComponent = computed(() => arg.value.type === ComponentArgPrimitive.Component)
const isBoolean = computed(() => arg.value.type === ComponentArgPrimitive.Boolean)
const isArray = computed(() => arg.value.type.slice(-2) === '[]')

const update = (value: string) => {
  emit('update:arg', { name: arg.value.name, value: value })
}
</script>
