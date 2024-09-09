export interface IDropdownMenuItem {
  label?: string
  labelKey?: string
  class?: string
  // TODO -- replace with INavigateOptions once available in external package
  to?: unknown
  linkTarget?: string
  loading?: boolean
  click?: () => void
}
