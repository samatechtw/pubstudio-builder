<template>
  <div v-if="editing" class="domain-row">
    <div class="label">
      <PSInput
        ref="valueInputRef"
        v-model="newDomain"
        class="value-input"
        :placeholder="t('sites.domain')"
        :errorBubble="errorMessage"
        @keydown.enter="emitUpdate"
        @keyup.esc="$event.srcElement.blur()"
      />
    </div>
    <div class="item">
      <Check class="item-save" color="#009879" @click.stop="emitUpdate" />
      <Minus class="item-delete" @click.stop="removeDomain" />
    </div>
  </div>
  <div v-else-if="domain" class="domain">
    <div class="label">
      {{ domain.domain }}
    </div>
    <div class="item">
      <Spinner v-if="verifying" color="#2a17d6" class="verifying" />
      <div
        v-else-if="!domain!.verified"
        class="item-verify"
        @click="emit('verify', domain!.domain)"
      >
        {{ t('verify') }}
      </div>
      <div v-else class="verified">
        {{ t('verified') }}
      </div>
      <Minus class="item-delete" @click.stop="removeDomain" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Check, Minus, PSInput, Reload, Spinner } from '@pubstudio/frontend/ui-widgets'
import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    editing?: boolean
    verifying?: boolean
    domain?: ICustomDomainRelationViewModel
  }>(),
  {
    domain: undefined,
  },
)
const { editing, domain, verifying } = toRefs(props)

const emit = defineEmits<{
  (e: 'save', newDomain: string): void
  (e: 'verify', domain: string): void
  (e: 'remove'): void
}>()

const valueInputRef = ref()
const newDomain = ref<string>(propOrNewDomain())
const errorMessage = ref()

function propOrNewDomain(): string {
  if (domain?.value) {
    // Use destructing assignment to prevent Ref from being passed by reference
    return domain.value.domain
  }
  return ''
}

const emitUpdate = () => {
  const valid = /^.+?[.:].+$/.test(newDomain.value)
  if (valid) {
    emit('save', newDomain.value)
  } else {
    errorMessage.value = t('errors.invalid_domain')
  }
}

const removeDomain = () => {
  if (!verifying.value) {
    emit('remove')
  }
}

onMounted(() => {
  if (editing.value) {
    valueInputRef.value?.inputRef.focus()
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.domain-row,
.domain {
  font-size: 14px;
  padding: 8px 0;
}

.item {
  display: flex;
  align-items: center;
  margin-left: 6px;
  overflow: hidden;
}

.item-verify,
.verified {
  @mixin caption;
  font-weight: medium;
  letter-spacing: 0.5px;
  cursor: pointer;
  flex-shrink: 0;
  color: $purple-500;
}
.verified {
  color: $green-700;
}

.item-delete {
  margin-left: 10px;
}

.label {
  width: 100%;
  display: flex;
  flex: 1 0 0;
  align-items: center;
}
.item {
  margin-left: auto;
  flex-shrink: 0;
}
.value-input {
  width: 200px;
  margin-left: 6px;
  :deep(.ps-input) {
    height: 36px;
  }
}
</style>
