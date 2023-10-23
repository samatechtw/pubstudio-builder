<template>
  <PSMenu :items="menuItems" clickawaySelector=".ps-user-menu" class="ps-user-menu">
    <template #toggle>
      <div class="avatar-image" v-html="identiconAvatar" />
      <div v-if="hasNotifications" class="notification" />
    </template>
  </PSMenu>
</template>

<script lang="ts" setup>
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useLoginRedirect } from '@pubstudio/web/feature-auth'
import { IDropdownMenuItem } from '@pubstudio/frontend/type-ui-widgets'
import { PSMenu } from '@pubstudio/frontend/ui-widgets'

const { identiconAvatar } = store.user
const { checkAuthRedirect } = useLoginRedirect()

const hasNotifications = false

const logout = () => {
  store.auth.logOut()
  checkAuthRedirect()
}

const menuItems: IDropdownMenuItem[] = [
  {
    class: 'sites-button',
    labelKey: 'sites.title',
    to: {
      name: 'Sites',
    },
  },
  {
    class: 'assets-button',
    labelKey: 'assets.title',
    to: {
      name: 'Assets',
    },
  },
  {
    class: 'settings-button',
    labelKey: 'settings.title',
    to: {
      name: 'Settings',
    },
  },
  {
    class: 'logout-button',
    labelKey: 'logout',
    click: logout,
  },
]
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-user-menu {
  .avatar-image {
    width: 40px;
    height: 40px;
    cursor: pointer;
    background-color: $black-opaque-15;
    border-radius: 50%;
    :deep(svg) {
      margin-top: -2px;
    }
  }
  :deep(.logout-button) {
    color: $color-red;
  }
}
</style>
