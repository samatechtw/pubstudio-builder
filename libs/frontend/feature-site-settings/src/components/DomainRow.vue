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
  <div v-else class="domain">
    <div class="label">
      {{ domain }}
    </div>
    <div class="item">
      <div class="edit-item">
        <Edit class="edit-icon" @click="edit" />
      </div>
      <Reload
        v-if="domain && !domain.verified"
        class="item-verify"
        @click="emit('verify', domain.domain)"
      />
      <Minus class="item-delete" @click.stop="removeDomain" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Check, Edit, Minus, PSInput, Reload } from '@pubstudio/frontend/ui-widgets'
import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    editing?: boolean
    domain?: ICustomDomainRelationViewModel
  }>(),
  {
    domain: undefined,
  },
)
const { editing, domain } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit', domain: string): void
  (e: 'update', newDomain: string | undefined): void
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

const edit = async () => {
  newDomain.value = propOrNewDomain()
  emit('edit', newDomain.value)
}

watch(editing, () => {
  if (editing.value) {
    errorMessage.value = undefined
    valueInputRef.value?.inputRef.focus()
  }
})

const emitUpdate = () => {
  const valid = /^.+?\..+$/.test(newDomain.value)
  if (valid) {
    emit('update', newDomain.value || undefined)
  } else {
    errorMessage.value = t('errors.invalid_domain')
  }
}

const removeDomain = () => {
  emit('remove')
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
.domain-row {
  :deep(.ps-multiselect:hover) {
    border: 1px solid $color-primary;
  }
}

.item {
  display: flex;
  align-items: center;
  margin-left: 6px;
  overflow: hidden;
}

.edit-item {
  margin-left: auto;
  overflow: hidden;
  .edit-icon {
    flex-shrink: 0;
  }
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
