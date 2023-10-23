<template>
  <div class="page-menu-edit">
    <div class="menu-row name-row">
      <div class="label">
        {{ t('name') }}
      </div>
      <PSInput
        v-model="editingPage.name"
        class="item name-input"
        name="name"
        :placeholder="t('name')"
        :isError="!!pageError.name"
      />
    </div>
    <div class="menu-row route-row">
      <div class="label">
        {{ t('build.route') }}
      </div>
      <InfoBubble
        v-if="editingPage.route === notFoundRoute"
        :message="t('build.route-not-found')"
        class="route-info"
      />
      <PSInput
        v-model="editingPage.route"
        class="item route-input"
        name="route"
        :placeholder="t('build.route')"
        datalistId="page-route"
        :datalist="predefinedRoutes"
        :isError="!!pageError.route"
      />
    </div>
    <div class="menu-row route-row">
      <div class="label">
        {{ t('build.public') }}
      </div>
      <Checkbox
        :item="publicCheckboxData"
        class="item public-checkbox"
        @checked="editingPage.public = $event"
      />
    </div>
    <ErrorMessage :error="pageError.name" />
    <ErrorMessage :error="pageError.route" />
    <div class="page-menu-edit-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        background="#451dd6"
        @click.stop="savePage"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="clearEditingState"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PSButton,
  PSInput,
  Checkbox,
  ErrorMessage,
  InfoBubble,
} from '@pubstudio/frontend/ui-widgets'
import { usePageMenu } from '../../lib/use-page-menu'

const { t } = useI18n()

const { pageError, editingPage, savePage, clearEditingState } = usePageMenu()

const publicCheckboxData = computed(() => ({
  checked: editingPage.public,
}))

const notFoundRoute = '/not-found'

const predefinedRoutes = [{ label: notFoundRoute, value: notFoundRoute }]
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.route-info {
  margin: 0 8px 0 auto;
}
.public-checkbox {
  margin: 8px 0;
}
.page-menu-edit-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  > button {
    width: 48%;
  }
}
</style>
