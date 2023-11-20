<template>
  <div class="head-row">
    <div class="tag">
      {{ tag }}
    </div>
    <div class="label">
      {{ label }}
    </div>
    <Minus class="remove" @click="emit('remove')" />
    <Edit class="edit" @click="emit('edit', element)" />
  </div>
</template>

<script lang="ts" setup>
import { Edit, Minus } from '@pubstudio/frontend/ui-widgets'
import { IHeadObject, IHeadTagStr } from '@pubstudio/shared/type-site'
import { computed, toRefs } from 'vue'

const props = defineProps<{
  tag: IHeadTagStr
  element: IHeadObject | string
}>()
const emit = defineEmits<{
  (e: 'edit', element: IHeadObject | string): void
  (e: 'remove'): void
}>()
const { element } = toRefs(props)

const label = computed(() => {
  const el = element.value
  if (typeof el === 'string') {
    return el
  } else if ('name' in el) {
    return el.name
  } else if ('title' in el) {
    return el.title
  } else if ('href' in el) {
    return el.href
  }
  return Object.values(el)[0] ?? ''
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.head-row {
  @mixin text 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding: 3px 0;
  border-top: 1px solid $grey-300;
}
.tag {
  font-weight: 500;
}
.label {
  @mixin truncate;
  margin: 0 auto 0 12px;
}
.edit,
.remove {
  @mixin size 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 6px;
}
</style>
