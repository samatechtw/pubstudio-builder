<template>
  <Modal :show="showVueComponentModal" cls="vue-component-modal" @cancel="hideModal">
    <div class="modal-title">
      {{ t('build.vue_title') }}
    </div>
    <div class="modal-text">
      {{ t('build.vue_text') }}
    </div>
    <ol>
      <li>{{ t('build.vue1') }}</li>
      <li>{{ t('build.vue2') }}</li>
      <li>{{ t('build.vue3') }}</li>
      <li>{{ t('build.vue4') }}</li>
    </ol>
    <div class="modal-actions">
      <PSButton class="ok-button" :text="t('ok')" @click="addVueComponent" />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click="hideModal"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { addBuiltinComponent } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useVueComponent } from '../lib/use-vue-component'
import { vueComponentId } from '@pubstudio/frontend/util-ids'

const { t } = useI18n()
const { site } = useSiteSource()
const { showVueComponentModal } = useVueComponent()

const hideModal = () => {
  showVueComponentModal.value = false
}

const addVueComponent = () => {
  addBuiltinComponent(site.value, { id: vueComponentId })
  hideModal()
}
</script>

<style lang="postcss">
@import '@theme/css/components/walkthrough.postcss';

.vue-component-modal {
  .modal-inner {
    width: 600px;
  }
  ol {
    margin: 12px 0 32px;
    color: black;
  }
  li {
    margin-top: 12px;
  }
  .cancel-button {
    margin-left: 16px;
  }
}
</style>
