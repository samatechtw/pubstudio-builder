export type ILocationQuery = Record<string, string | string[] | undefined>

export type ILocationParams = Record<string, string | undefined>

export interface ILocationParts {
  params: ILocationParams
  query: ILocationQuery
  hash: string
}
