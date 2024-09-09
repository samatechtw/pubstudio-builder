export type ILocationQuery = Record<string, string | string[] | undefined>

export interface ILocationParts {
  params: Record<string, string | undefined>
  query: ILocationQuery
  hash: string
}
