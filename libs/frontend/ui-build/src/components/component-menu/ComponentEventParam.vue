<template>
  <div class="menu-row">
    <div class="label">
      {{ label }}
    </div>
    <Checkbox
      v-if="param.type === ComponentArgPrimitive.Boolean"
      class="event-param-checkbox"
      :item="{ label: '', checked: value === 'true' }"
      @checked="emit('update', $event.toString())"
    />
    <PSMultiselect
      v-else-if="param.options"
      :value="newValue"
      class="param-option"
      :placeholder="t('build.event_type')"
      :options="param.options"
      :clearable="false"
      @select="selectValue"
      @click.stop
    />
    <PSInput
      v-else
      v-model="newValue"
      class="item"
      :placeholder="t('value')"
      @update:modelValue="setValue"
      @keydown.enter="setValue"
      @keyup.esc="($event.target as HTMLInputElement)?.blur()"
    />
    <InfoBubble
      v-if="param.infoKey"
      :message="t(param.infoKey)"
      :showArrow="false"
      :useHtml="true"
      class="info-bubble"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  Checkbox,
  InfoBubble,
  PSInput,
  PSMultiselect,
} from '@pubstudio/frontend/ui-widgets'
import { ComponentArgPrimitive, IEventParamEntry } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const { param } = defineProps<{
  label: string
  param: IEventParamEntry
}>()

const emit = defineEmits<{
  (e: 'update', value: string | undefined): void
}>()

const newValue = ref()

const value = computed(() => (param.value ?? '').toString())

const setValue = () => {
  emit('update', newValue.value || undefined)
}

const selectValue = (val: string | undefined) => {
  newValue.value = val
  setValue()
}

watch(
  () => param,
  (updatedParam) => {
    newValue.value = (updatedParam.value ?? '').toString()
  },
)

onMounted(async () => {
  await nextTick()
  newValue.value = value.value ?? ''
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.label {
  @mixin title-bold 13px;
}
.item {
  margin-left: auto;
}
.info-bubble {
  margin-left: 8px;
}
.event-param-checkbox {
  margin: 0;
}
.param-option {
  margin-left: auto;
  height: 34px;
}
:deep(.ps-input) {
  padding: 0 10px;
  height: 32px;
}
</style>
