<template>
  <div class="edit-breakpoint-row">
    <div class="cols-wrap">
      <div class="col name-col">
        <STInput v-model="breakpoint.name" :placeholder="t('name')" />
      </div>
      <div class="col min-width-col">
        <STInput
          :modelValue="breakpoint.minWidth"
          type="number"
          :placeholder="t('build.breakpoint.min_width')"
          @update:modelValue="emit('update:minWidth', $event)"
        />
      </div>
      <div class="col max-width-col">
        <STInput
          :modelValue="breakpoint.maxWidth"
          type="number"
          :placeholder="t('build.breakpoint.max_width')"
          @update:modelValue="emit('update:maxWidth', $event)"
        />
      </div>
    </div>
    <ErrorMessage v-if="errorKey" :error="t(errorKey)" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { ErrorMessage } from '@pubstudio/frontend/ui-widgets'
import { toRefs } from 'vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    breakpoint: IBreakpoint
    errorKey?: string
  }>(),
  {
    errorKey: undefined,
  },
)

const { breakpoint } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:minWidth', value: string): void
  (e: 'update:maxWidth', value: string): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.edit-breakpoint-row {
  .cols-wrap {
    display: flex;
    align-items: center;
    .col {
      @mixin title-semibold 15px;
      width: 33%;
      padding: 0 4px;
    }
  }
  & + & {
    margin-top: 12px;
  }
  :deep(.error) {
    padding-top: 4px;
  }
}
</style>
