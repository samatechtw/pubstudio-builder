<template>
  <div class="array-arg-wrap">
    <div v-for="(a, index) in argArray" :key="index" class="arg-wrap">
      <ComponentArg
        :arg="{ ...arg, type: argType }"
        :value="a"
        class="arg-item"
        @update:arg="update($event, index)"
      />
      <Minus class="minus" @click="removeArg(index)" />
    </div>
    <div class="add-wrap">
      <Plus class="add" @click="addArg" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import {
  ComponentArgPrimitive,
  IBehaviorArg,
  IComponentInput,
} from '@pubstudio/shared/type-site'
import ComponentArg from './ComponentArg.vue'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'
import { computed } from 'vue'
import { Minus, Plus } from '@pubstudio/frontend/ui-widgets'

const props = defineProps<{
  arg: IComponentInput | IBehaviorArg
  value: unknown
}>()
const { arg, value } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:arg', payload: IUpdateComponentArgPayload): void
}>()

const argArray = computed(() => {
  return ((value.value ?? '') as string).split(',')
})

const argType = computed(() => {
  return arg.value.type.replace('[]', '') as ComponentArgPrimitive
})

const update = (val: IUpdateComponentArgPayload, index: number) => {
  const args = [...argArray.value]
  args[index] = val.value as string
  emit('update:arg', { name: arg.value.name, value: args.join(',') })
}

const removeArg = (index: number) => {
  const arr = [...argArray.value]
  arr.splice(index, 1)
  emit('update:arg', {
    name: arg.value.name,
    value: arr.join(','),
  })
}

const addArg = () => {
  emit('update:arg', {
    name: arg.value.name,
    value: [...argArray.value, ''].join(','),
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.arg-wrap {
  margin-bottom: 6px;
}
.arg-wrap {
  display: flex;
  align-items: center;
}
.add-wrap {
  text-align: center;
}
.add {
  @mixin size 24px;
  cursor: pointer;
}
.minus {
  @mixin size 20px;
  margin-left: 6px;
  cursor: pointer;
}
.arg-item {
  flex-grow: 1;
  margin-left: 6px;
  :deep(.item) {
    margin-left: 0;
  }
}
</style>
