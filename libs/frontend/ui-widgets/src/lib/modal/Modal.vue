<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-outer" :class="cls" @mousedown="clickOutside">
        <div class="modal-inner">
          <ModalClose v-if="!disableClose" :color="closeColor" @click="emit('cancel')" />
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { setCancelNextEsc } from '@pubstudio/frontend/feature-build-event'
import { useHotkeyControl } from '@pubstudio/frontend/feature-build-event'
import ModalClose from './ModalClose.vue'

const props = withDefaults(
  defineProps<{
    show?: boolean
    cls?: string
    closeColor?: string
    disableClose?: boolean
    cancelByClickingOutside?: boolean
    cancelWithEscape?: boolean
    escapeEvent?: 'keyup' | 'keydown'
  }>(),
  {
    closeColor: 'black',
    cls: undefined,
    cancelByClickingOutside: true,
    cancelWithEscape: true,
    escapeEvent: 'keydown',
  },
)
const { show, cancelByClickingOutside, escapeEvent, cancelWithEscape } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
}>()
const { setHotkeysDisabled } = useHotkeyControl()

const listenersActive = ref(false)

function clickOutside(e: Event) {
  if (
    e.target &&
    e.target instanceof Element &&
    typeof e.target.className === 'string' &&
    e.target.className.split(' ').indexOf('modal-outer') >= 0 &&
    cancelByClickingOutside.value
  ) {
    emit('cancel')
  }
}
function escape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    setCancelNextEsc(true)
    if (cancelWithEscape.value && e.key === 'Escape') {
      emit('cancel')
    }
  }
}

const modalSetup = (show: boolean) => {
  if (show === listenersActive.value) {
    return
  }
  if (show) {
    document.addEventListener(escapeEvent.value, escape)
    document.body.classList.add('noscroll')
  } else {
    document.removeEventListener(escapeEvent.value, escape)
    document.body.classList.remove('noscroll')
  }
  setHotkeysDisabled(show)
  listenersActive.value = show
}

watch(show, modalSetup)

onMounted(() => {
  modalSetup(show.value)
})

onUnmounted(() => {
  modalSetup(false)
})
</script>
