<template>
  <Modal
    :show="!!editor?.contactFormWalkthrough"
    :cancelByClickingOutside="false"
    cls="contact-walkthrough"
    @cancel="hideModal"
  >
    <Transition name="fade">
      <div v-if="loadingTables" class="loading-wrap">
        <PSSpinner :scale="3" color="#2a17d6" />
      </div>
      <ContactFormInit v-else-if="state === ContactFormWalkthroughState.Init" />
      <ContactFormLink v-else-if="state === ContactFormWalkthroughState.LinkTable" />
      <ContactFormCreate v-else-if="state === ContactFormWalkthroughState.CreateTable" />
      <ContactFormRecipients
        v-else-if="state === ContactFormWalkthroughState.Recipients"
      />
    </Transition>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { Modal, PSSpinner } from '@pubstudio/frontend/ui-widgets'
import { setContactFormWalkthrough } from '@pubstudio/frontend/data-access-command'
import { ContactFormWalkthroughState } from '@pubstudio/shared/type-site'
import ContactFormInit from './ContactFormInit.vue'
import ContactFormLink from './ContactFormLink.vue'
import ContactFormCreate from './ContactFormCreate.vue'
import ContactFormRecipients from './ContactFormRecipients.vue'
import { useContactForm } from '../lib/use-contact-form'

const { editor } = useBuild()
const { loadingTables, loadCustomTables } = useContactForm()

const state = computed(() => editor.value?.contactFormWalkthrough?.state)

const hideModal = () => {
  setContactFormWalkthrough(editor.value, undefined)
}

onMounted(async () => {
  if (state.value) {
    await loadCustomTables()
  }
})
</script>

<style lang="postcss">
@import '@theme/css/components/walkthrough.postcss';
</style>
