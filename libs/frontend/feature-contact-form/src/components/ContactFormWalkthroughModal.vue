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
@import '@theme/css/mixins.postcss';

.contact-form-wrap {
  @mixin flex-col;
  width: 100%;
  height: 100%;
  color: black;
}
.contact-form-row {
  display: flex;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
}
.contact-form-text {
  @mixin title-thin 18px;
  margin-top: 24px;
  text-align: center;
}
.contact-form-title {
  @mixin title 22px;
  text-align: center;
}
.contact-form-actions {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  margin-top: auto;
}

.contact-walkthrough {
  .modal-inner {
    min-height: 360px;
    height: 360px;
  }
  .loading-wrap {
    @mixin flex-center;
    height: 100%;
  }
  .fade-leave-to {
    top: 0;
    left: 0;
    padding: 32px 24px 24px;
    width: 100%;
    height: 100%;
  }
}
</style>
