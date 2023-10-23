<template>
  <Modal cls="confirm-modal" @cancel="emit('cancel')">
    <div v-if="title" class="modal-title">
      {{ title }}
    </div>
    <div class="modal-text">
      <slot name="text" />
      {{ text ?? '' }}
    </div>
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="t('confirm')"
        :animate="loading"
        @click="emit('confirm')"
      />
      <PSButton
        class="cancel-button"
        :text="computedCancelText"
        variant="secondary"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Modal from './Modal.vue'
import PSButton from '../form/PSButton.vue'
import { computed, toRefs } from 'vue'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const props = withDefaults(
  defineProps<{
    title?: string
    text?: string
    loading?: boolean
    cancelText?: string
  }>(),
  {
    title: undefined,
    text: undefined,
    cancelText: undefined,
  },
)

const { cancelText } = toRefs(props)

// Use `computed` here because `t` is not available in `defineProps`.
// Full error message:
// [@vue/compiler-sfc] `defineProps()` in <script setup> cannot reference
// locally declared variables because it will be hoisted outside of the
// setup() function. If your component options require initialization in
// the module scope, use a separate normal <script> to export the options instead.
const computedCancelText = computed(() => cancelText.value ?? t('cancel'))
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.confirm-modal {
  .modal-buttons {
    @mixin flex-row;
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
  }
}
</style>
