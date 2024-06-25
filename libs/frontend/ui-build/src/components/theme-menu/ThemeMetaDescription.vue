<template>
  <div class="description-wrap">
    <div class="description-label">
      <div class="label">
        {{ t('description') }}
      </div>
      <Check v-if="editing" class="item-save" color="#009879" @click="setValue" />
      <Edit v-else class="edit-icon" @click="editValue" />
      <InfoBubble
        :message="t('theme.description')"
        :showArrow="false"
        class="info-bubble"
      />
    </div>
    <div class="description">
      <textarea
        v-if="editing"
        v-model="newValue"
        class="item meta-description"
        :placeholder="t('description')"
        rows="6"
        @keyup.esc="($event.target as HTMLInputElement)?.blur()"
      />
      <div v-else class="item edit-item" :class="{ none: !value }">
        {{ value || t('none') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Check, Edit, InfoBubble, PSInput } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    value?: string | undefined
  }>(),
  {
    value: undefined,
  },
)
const { value } = toRefs(props)

const emit = defineEmits<{
  (e: 'update', value: string | undefined): void
}>()

const newValue = ref()
const newValueRef = ref<InstanceType<typeof PSInput> | undefined>()
const editing = ref(false)

const editValue = async () => {
  editing.value = true
  newValue.value = value.value ?? ''
  await nextTick()
  newValueRef.value?.inputRef?.focus()
}

const setValue = () => {
  emit('update', newValue.value || undefined)
  editing.value = false
}

watch(value, (updatedValue) => {
  newValue.value = updatedValue
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.description-wrap {
  border-bottom: 1px solid $grey-100;
  padding-bottom: 8px;
}
.description-label {
  display: flex;
  width: 100%;
  padding: 7px 0 6px;
}
.label {
  @mixin title-bold 13px;
}
.item-save {
  margin-left: auto;
}
.none {
  color: $grey-700;
}
.meta-description {
  margin-left: auto;
  width: 100%;
}
.edit-icon {
  cursor: default;
  margin-left: auto;
}
.info-bubble {
  margin-left: 8px;
}
</style>
