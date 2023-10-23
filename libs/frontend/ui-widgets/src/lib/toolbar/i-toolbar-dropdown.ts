import { ComputedRef } from 'vue'

import type { Component } from 'vue'

export interface IToolbarDropdownItem {
  active: ComputedRef<boolean>
  icon: Component
  tooltip?: string
  class?: string
  click: () => void
}
