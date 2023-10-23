export interface IRoute {
  name: string
  label: string
  labelClass?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>
  replace?: boolean
}
