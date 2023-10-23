import { RouteLocationRaw } from 'vue-router'

export interface IDropdownMenuItem {
  label?: string
  labelKey?: string
  class?: string
  to?: RouteLocationRaw
  linkTarget?: string
  loading?: boolean
  click?: () => void
}
