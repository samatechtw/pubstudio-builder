<template>
  <div class="component-arg">
    <div class="label">
      <div class="name">
        {{ arg.name }}
      </div>
      <div class="type">
        {{ arg.type }}
      </div>
      <InfoBubble v-if="'help' in arg && arg.help" :message="arg.help" class="help" />
    </div>
    <ComponentArg
      :arg="arg"
      :value="value"
      class="item"
      @update:arg="emit('update:arg', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { IBehaviorArg, IComponentInput } from '@pubstudio/shared/type-site'
import { IUpdateComponentArgPayload } from './i-update-component-arg-payload'
import ComponentArg from './ComponentArg.vue'
import { InfoBubble } from '@pubstudio/frontend/ui-widgets'

const emit = defineEmits<{
  (e: 'update:arg', payload: IUpdateComponentArgPayload): void
}>()
defineProps<{
  arg: IComponentInput | IBehaviorArg
  value: unknown
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';
.component-arg {
  display: flex;
  width: 100%;
  margin-top: 6px;
}
.label {
  @mixin text 15px;
  width: 50%;
  display: flex;
  align-items: center;
}
.name {
  margin-right: 4px;
}
.type {
  color: $color-primary;
}
.help {
  margin: 0 4px;
}
.item {
  margin-left: 6px;
  width: 50%;
}
</style>
