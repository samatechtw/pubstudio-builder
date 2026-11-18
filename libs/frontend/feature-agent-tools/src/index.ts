import { defineAsyncComponent } from 'vue'

export * from './lib/agent-tools-enabled'
export type { IPubStudioAgentApi } from './lib/install'
export type { Result as AgentToolResult } from './lib/result'

// Async so zod-free-but-still-sizeable op schemas stay out of the default builder bundle.
// Everything else in this lib is reached through the bridge, not the public entry point.
export const AgentToolsBridge = defineAsyncComponent(
  () => import('./lib/AgentToolsBridge.vue'),
)
