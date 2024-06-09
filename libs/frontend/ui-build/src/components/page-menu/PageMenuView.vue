<template>
  <div class="page-menu-view">
    <MenuRow :label="t('name')" :value="page?.name" :editable="false" />
    <MenuRow :label="t('build.route')" :value="route" :editable="false" />
    <MenuRow
      :label="t('build.public')"
      :value="page?.public ? t('yes') : t('no')"
      :editable="false"
    />
    <MenuRow :label="t('build.home_page')" :editable="false">
      <template #item>
        <span v-if="isHomePage">{{ t('yes') }}</span>
        <PSButton
          v-else
          :text="t('build.set_home')"
          size="small"
          @click="showConfirmSetHomePage = true"
        />
      </template>
    </MenuRow>
    <div class="actions">
      <PSButton :text="t('build.edit_page')" size="small" @click="edit" />
      <PSButton
        v-if="removable"
        class="remove-button"
        size="small"
        :text="t('build.remove_page')"
        @click="showConfirmRemove = true"
      />
    </div>
    <ConfirmModal
      :show="showConfirmSetHomePage"
      :title="t('build.confirm_set_home')"
      :text="t('build.set_home_text')"
      @confirm="setAsHomePage"
      @cancel="showConfirmSetHomePage = false"
    />
    <ConfirmModal
      :show="showConfirmRemove"
      :title="t('build.confirm_delete')"
      :text="t('build.delete_page')"
      @confirm="removeCurrentPage"
      @cancel="showConfirmRemove = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSButton, ConfirmModal } from '@pubstudio/frontend/ui-widgets'
import { useBuild, usePageMenu } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import MenuRow from '../MenuRow.vue'

const { t } = useI18n()
const { pages, setEditingPage, removePage } = usePageMenu()
const { site } = useSiteSource()
const { editor, setHomePage } = useBuild()

const showConfirmSetHomePage = ref(false)
const showConfirmRemove = ref(false)

const removable = computed(() => pages.value.length > 1)
const route = computed(() => editor.value?.editPageRoute)
const page = computed(() => (route.value ? site.value.pages[route.value] : undefined))

const isHomePage = computed(() => site.value.defaults.homePage === route.value)

const setAsHomePage = () => {
  if (route.value) {
    setHomePage(route.value)
    showConfirmSetHomePage.value = false
  }
}

const edit = () => {
  if (route.value) {
    setEditingPage(route.value)
  }
}

const removeCurrentPage = () => {
  if (route.value) {
    removePage(route.value)
  }
  showConfirmRemove.value = false
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.actions {
  margin-top: 16px;
  display: flex;
  :deep(.p-button.large) {
    padding: 0 8px;
    font-size: 16px;
    flex-grow: 1;
  }
}
.remove-button {
  margin-left: 8px;
}
:deep(.edit-item) {
  color: $grey-500;
}
</style>
