<template>
  <div :id="assetMenuId" class="asset-dropdown-wrap" :class="{ opened }">
    <div ref="toggleRef" class="dropdown-toggle" @click="toggleMenu">
      <MenuHorizontal class="toggle-icon" />
    </div>
    <Teleport to="body">
      <div
        ref="menuRef"
        class="ps-dropdown asset-dropdown"
        :class="{ 'ps-dropdown-opened': opened }"
        :style="menuStyle"
      >
        <div class="ps-dropdown-item rename-action" @click="replaceAsset">
          {{ t('replace') }}
        </div>
        <div class="ps-dropdown-item preview-action" @click="previewAsset">
          {{ t('build.preview') }}
        </div>
        <div class="ps-dropdown-item delete-action" @click="deleteAsset">
          {{ t('delete') }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { useDropdown } from '@samatech/vue-components'
import { MenuHorizontal } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

const { assetId } = defineProps<{
  assetId: string
}>()
const emit = defineEmits<{
  (e: 'delete'): void
  (e: 'preview'): void
  (e: 'replace'): void
}>()

const assetMenuId = `am-${assetId}`

const { toggleRef, menuRef, opened, menuStyle, setMenuOpened, toggleMenu } = useDropdown({
  clickawayIgnoreSelector: `#${assetMenuId}`,
})

const closeMenu = () => setMenuOpened(false)

const previewAsset = () => {
  emit('preview')
  closeMenu()
}

const replaceAsset = () => {
  emit('replace')
  closeMenu()
}

const deleteAsset = () => {
  emit('delete')
  closeMenu()
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';
.asset-dropdown-wrap {
  position: relative;
  z-index: 999;
  margin-left: auto;
  transition: opacity 0.25s ease;
  opacity: 1;
  &.opened {
    opacity: 1 !important;
  }
}
.asset-dropdown {
}
.dropdown-toggle {
  @mixin size 26px;
  position: relative;
  cursor: pointer;
  z-index: 10;
  background-color: white;
  border-radius: 50%;
}
.delete-action {
  color: $color-error;
}
</style>
