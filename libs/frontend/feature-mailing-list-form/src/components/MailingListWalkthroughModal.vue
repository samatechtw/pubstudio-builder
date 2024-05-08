<template>
  <Modal
    :show="!!editor?.mailingListWalkthrough"
    :cancelByClickingOutside="false"
    cls="walkthrough"
    @cancel="hideModal"
  >
    <Transition name="fade">
      <div v-if="loadingTables" class="loading-wrap">
        <Spinner :size="18" color="#2a17d6" />
      </div>
      <MailingListInit v-else-if="state === MailingListWalkthroughState.Init" />
      <MailingListLink v-else-if="state === MailingListWalkthroughState.LinkTable" />
      <MailingListCreate v-else-if="state === MailingListWalkthroughState.CreateTable" />
    </Transition>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { Modal, Spinner } from '@pubstudio/frontend/ui-widgets'
import { setMailingListWalkthrough } from '@pubstudio/frontend/data-access-command'
import { MailingListWalkthroughState } from '@pubstudio/shared/type-site'
import MailingListInit from './MailingListInit.vue'
import MailingListLink from './MailingListLink.vue'
import MailingListCreate from './MailingListCreate.vue'
import { useMailingListForm } from '../lib/use-mailing-list-form'

const { editor } = useBuild()
const { loadingTables, loadMailingListTables } = useMailingListForm()

const state = computed(() => editor.value?.mailingListWalkthrough?.state)

const hideModal = () => {
  setMailingListWalkthrough(editor.value, undefined)
}

onMounted(async () => {
  if (state.value) {
    await loadMailingListTables()
  }
})
</script>

<style lang="postcss">
@import '@theme/css/components/walkthrough.postcss';
</style>
