<template>
  <div class="custom-domains-wrap">
    <div class="custom-domains">
      <div class="custom-title">
        <div class="label">
          {{ t('sites.custom') }}
        </div>
        <Plus
          v-if="newDomain === undefined && editDomainIndex === undefined"
          class="item-add"
          @click="newDomain = ''"
        />
      </div>
      <div class="custom-explainer">
        <span>{{ t('sites.custom_explainer') }}</span>
        <a
          target="_blank"
          href="https://blog.pubstud.io/custom-domains"
          class="read-more"
        >
          {{ t('read') }}
        </a>
      </div>
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
        @verify="verifyDomain(-1)"
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
        @verify="verifyDomain(index)"
        @remove="updateDomain(index, undefined)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { toRefs, watch } from 'vue'
import { useEditDomains } from '../lib/use-edit-domains'
import DomainRow from './DomainRow.vue'
import { Plus } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

const props = defineProps<{
  initialDomains: string[] | undefined
}>()
const { initialDomains } = toRefs(props)

const emit = defineEmits<{
  (e: 'updateDomains', domains: string[] | undefined): void
}>()

const {
  updatedDomains,
  newDomain,
  editDomainIndex,
  setCustomDomain,
  verifyCustomDomain,
} = useEditDomains()

updatedDomains.value = [...(initialDomains.value ?? [])]

watch(initialDomains, (domains) => {
  updatedDomains.value = domains
})

const updateDomain = (index: number, domain: string | undefined) => {
  setCustomDomain(index, domain)
  emit('updateDomains', updatedDomains.value)
}

const verifyDomain = (index: number) => {
  verifyCustomDomain(index)
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
.custom-title {
  @mixin title-bold 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-add {
  margin-left: 16px;
}
.custom-explainer {
  @mixin text 13px;
  margin: 8px auto 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid $border1;
  text-align: center;
  max-width: 300px;
}
.read-more {
  margin-left: 6px;
  text-decoration: underline;
}
.custom-domains {
  width: 100%;
}
.menu-subtitle {
  max-width: 200px;
  margin: 0 auto;
  color: black;
}
.no-domains {
  @mixin text 15px;
  color: $grey-500;
  margin-top: 16px;
  text-align: center;
}
</style>
