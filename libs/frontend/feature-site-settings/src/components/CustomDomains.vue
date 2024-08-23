<template>
  <div class="custom-domains-wrap">
    <div class="custom-domains" :class="{ updating }">
      <div class="custom-title">
        <div class="label">
          {{ t('sites.custom') }}
        </div>
        <Plus
          v-if="newDomain === undefined"
          class="item-add"
          @click="emit('setNewDomain', '')"
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
      <div v-if="domains?.length === 0 && newDomain === undefined" class="no-domains">
        {{ t('sites.no_domains') }}
      </div>
      <DomainRow
        v-if="newDomain !== undefined"
        :editing="true"
        class="new-domain menu-row"
        @save="addDomain($event)"
        @remove="emit('setNewDomain', undefined)"
      />
      <DomainRow
        v-for="d in domains"
        :key="d.domain"
        :domain="d"
        :verifying="d.domain === verifying"
        class="menu-row"
        @verify="verifyDomain(d.domain)"
        @remove="removeDomain(d.domain)"
      />
    </div>
    <div v-if="updating" class="domains-updating">
      <Spinner :size="20" color="#2a17d6" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Plus, Spinner } from '@pubstudio/frontend/ui-widgets'
import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'
import DomainRow from './DomainRow.vue'

const { t } = useI18n()

const props = defineProps<{
  domains: ICustomDomainRelationViewModel[] | undefined
  newDomain: string | undefined
  updating: string | undefined
  verifying: string | undefined
}>()
const { domains } = toRefs(props)

const emit = defineEmits<{
  (e: 'setNewDomain', domain: string | undefined): void
  (e: 'addDomain', domain: string): void
  (e: 'deleteDomain', domain: string): void
  (e: 'verifyDomain', domain: string): void
}>()

const addDomain = (domain: string) => {
  emit('addDomain', domain)
}

const removeDomain = (domain: string) => {
  emit('deleteDomain', domain)
}

const verifyDomain = (domain: string) => {
  emit('verifyDomain', domain)
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
  position: relative;
}
.domains-updating {
  @mixin overlay;
  @mixin flex-center;
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
  &.updating {
    opacity: 0.4;
  }
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
