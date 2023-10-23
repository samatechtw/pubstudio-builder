export interface ILocationParts {
  params: Record<string, string | undefined>
  query: Record<string, string | string[] | undefined>
  hash: string
}
