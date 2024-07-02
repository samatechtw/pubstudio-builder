<template>
  <div class="custom-domains-wrap">
    <div class="custom-domains">
      <EditMenuTitle
        :title="t('sites.custom')"
        :showAdd="newDomain === undefined && editDomainIndex === undefined"
        @add="newDomain = ''"
      />
      <div
        v-if="updatedDomains?.length === 0 && newDomain === undefined"
        class="no-domains"
      >
        {{ t('sites.no_domains') }}
      </div>
      <DomainRow
        v-if="newDomain !== undefined"
        :editing="true"
        class="new-domain menu-row"
        @update="updateDomain(-1, $event)"
        @remove="newDomain = undefined"
      />
      <DomainRow
        v-for="(domain, index) in updatedDomains"
        :key="domain"
        :domain="domain"
        :editing="editDomainIndex === index"
        class="menu-row"
        @edit="editDomainIndex = index"
        @update="updateDomain(index, $event)"
        @remove="updateDomain(index, undefined)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { toRefs, watch } from 'vue'
import { EditMenuTitle } from '@pubstudio/frontend/ui-build'
import { useEditDomains } from '../lib/use-edit-domains'
import DomainRow from './DomainRow.vue'

const { t } = useI18n()

const props = defineProps<{
  initialDomains: string[] | undefined
}>()
const { initialDomains } = toRefs(props)

const emit = defineEmits<{
  (e: 'updateDomains', domains: string[] | undefined): void
}>()

const { updatedDomains, newDomain, editDomainIndex, setCustomDomain } = useEditDomains()

updatedDomains.value = [...(initialDomains.value ?? [])]

watch(initialDomains, (domains) => {
  updatedDomains.value = domains
})

const updateDomain = (index: number, domain: string | undefined) => {
  setCustomDomain(index, domain)
  emit('updateDomains', updatedDomains.value)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.domains-label {
  @mixin title-medium 15px;
  color: black;
  margin-bottom: 8px;
  text-align: center;
}
.custom-domains-wrap {
  width: 100%;
  margin: 16px auto 0;
  max-width: 360px;
}
.custom-domains {
  width: 100%;
  .menu-subtitle {
    max-width: 200px;
    margin: 0 auto;
    color: black;
  }
}
.no-domains {
  @mixin text 15px;
  color: $grey-500;
  margin-top: 16px;
  text-align: center;
}
</style>
