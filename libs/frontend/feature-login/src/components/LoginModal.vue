<template>
  <Modal
    :show="show"
    cls="login-modal"
    :cancelByClickingOutside="false"
    @cancel="closeModal"
  >
    <div class="modal-title">
      {{ t('auth.login') }}
    </div>
    <div class="modal-text">
      {{ t('auth.modal_text') }}
    </div>

    <form @submit.prevent="login">
      <STInput
        v-model="payload.email"
        name="email"
        class="email-input"
        type="email"
        :placeholder="t('email')"
        :isDisabled="loading"
      />
      <PasswordInput
        v-model="payload.password"
        class="password-input"
        :placeholder="t('auth.password')"
        :isDisabled="loading"
      />
      <ErrorMessage :error="error" />
      <div class="login-actions">
        <PSButton
          type="submit"
          class="login-button"
          :text="t('auth.login')"
          :secondary="true"
          :animate="loading"
          :disabled="loading"
          @click="login"
        >
          <template #trailing-icon>
            <ArrowShort />
          </template>
        </PSButton>
      </div>
    </form>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import {
  ArrowShort,
  ErrorMessage,
  Modal,
  PasswordInput,
  PSButton,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { StoreInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { usePlatformLogin } from '../lib/use-platform-login'

const { t } = useI18n()
const store = inject(StoreInjectionKey) as IFrontendStore
const { payload, error, platformLogin } = usePlatformLogin()
const { site, siteStore } = useSiteSource()

const loading = ref(false)

const show = computed(() => {
  const error = siteStore.value.saveError
  return error?.status === 401
})

const closeModal = () => {
  siteStore.value.saveError = undefined
}

const login = async () => {
  loading.value = true
  try {
    const success = await platformLogin()
    if (success) {
      await forceSave()
      closeModal()
    }
  } catch (e) {
    console.log('Login failed', e)
  }
  loading.value = false
}

const forceSave = () => {
  return siteStore.value.save(site.value, {
    immediate: true,
    ignoreUpdateKey: true,
    forceUpdate: true,
  })
}

const checkLoggedIn = async () => {
  // If the user is already logged in, and there's an auth redirect, follow it
  if (store.auth.loggedIn.value) {
    if (siteStore.value.saveError) {
      await forceSave()
    }
    closeModal()
  }
}

const refreshStore = () => {
  store.auth.refreshData()
  checkLoggedIn()
}

onMounted(() => {
  checkLoggedIn()
  document.addEventListener('visibilitychange', refreshStore)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', refreshStore)
})
</script>

<style lang="postcss">
.login-modal {
  .modal-inner {
    width: 95%;
    max-width: 340px;
    overflow-y: scroll;
  }
  .email-input {
    margin-top: 16px;
  }
  .password-input {
    margin-top: 8px;
  }
  .login-actions {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}
</style>
