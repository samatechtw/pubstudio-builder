<template>
  <div class="agent-tools-badge" :title="title">
    <span class="agent-tools-dot" />
    <span class="agent-tools-label">{{ label }}</span>
    <button class="agent-tools-off" title="Disconnect agent tools" @click="disconnect">
      ✕
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { computed, onBeforeUnmount, ref } from 'vue'
import { disableAgentTools } from './agent-tools-enabled'
import { installAgentTools } from './install'
import { currentIdentity } from './tools/session'

// useSiteSource injects, so it has to run in setup
const siteSource = useSiteSource()
const uninstall = installAgentTools(siteSource)
const connected = ref(true)

const identity = computed(() => (connected.value ? currentIdentity() : undefined))

const label = computed(() => identity.value?.client ?? 'Agent tools')

const title = computed(() =>
  identity.value
    ? `window.PubStudio is available to ${identity.value.client}`
    : 'window.PubStudio is available; waiting for identify()',
)

const disconnect = () => {
  uninstall()
  disableAgentTools()
  connected.value = false
}

onBeforeUnmount(uninstall)
</script>

<style lang="postcss" scoped>
.agent-tools-badge {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(27, 56, 88, 0.9);
  color: #ffffff;
  font-size: 12px;
  pointer-events: auto;
}
.agent-tools-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6ee7a8;
}
.agent-tools-label {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agent-tools-off {
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  padding: 0 2px;
}
</style>
