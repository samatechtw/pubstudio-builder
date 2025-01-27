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
      <div v-if="server" class="custom-explainer">
        <div class="explainer-text">
          <span>{{ t('sites.custom_explainer') }}</span>
          <a
            target="_blank"
            href="https://blog.pubstud.io/custom-domains"
            class="read-more"
          >
            {{ t('read') }}
          </a>
        </div>
        <div class="dns-row row-title">
          <div class="name">
            {{ t('name') }}
          </div>
          <div class="type">
            {{ t('type') }}
          </div>
          <div class="value">
            {{ t('value') }}
          </div>
        </div>
        <div v-if="server.ip_address" class="dns-row">
          <div class="name">
            {{ '@' }}
          </div>
          <div class="type">
            {{ 'A' }}
          </div>
          <div class="value">
            <div>{{ server.ip_address }}</div>
            <CopyText :text="server.ip_address" tooltip="copy" class="copy-text" />
          </div>
        </div>
        <div class="dns-row">
          <div class="name">
            {{ 'www.mydomain.com' }}
          </div>
          <div class="type">
            {{ 'CNAME' }}
          </div>
          <div class="value">
            <div>{{ serverAddress }}</div>
            <CopyText :text="serverAddress" tooltip="copy" class="copy-text" />
          </div>
        </div>
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
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { CopyText, Plus, Spinner } from '@pubstudio/frontend/ui-widgets'
import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'
import DomainRow from './DomainRow.vue'
import { ISiteServerRelationViewModel } from '@pubstudio/shared/type-api-platform-site'

const { t } = useI18n()

const props = defineProps<{
  domains: ICustomDomainRelationViewModel[] | undefined
  server: ISiteServerRelationViewModel | undefined
  newDomain: string | undefined
  updating: boolean | undefined
  verifying: string | undefined
}>()
const { domains, server } = toRefs(props)

const emit = defineEmits<{
  (e: 'setNewDomain', domain: string | undefined): void
  (e: 'addDomain', domain: string): void
  (e: 'deleteDomain', domain: string): void
  (e: 'verifyDomain', domain: string): void
}>()

const serverAddress = computed(() => {
  const address = server.value?.address
  if (!address) {
    return ''
  }
  return address.replace(/^https?:\/\//i, '')
})

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
.dns-row {
  display: flex;
  margin-bottom: 6px;
  text-align: left;
  align-items: center;
}
.row-title {
  font-weight: 700;
}
.name {
  width: 40%;
}
.type {
  width: 20%;
}
.value {
  display: flex;
  width: 40%;
  > div:first-child {
    min-width: 100px;
  }
}
.copy {
  @mixin size 18px;
  margin-left: 6px;
}
.custom-domains-wrap {
  width: 100%;
  margin: 16px auto 0;
  max-width: 400px;
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
  width: 100%;
}
.explainer-text {
  margin-bottom: 16px;
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
