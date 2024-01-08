import { ISortOption } from '@pubstudio/shared/type-sort'

export interface IListPlatformTemplatesRequest extends ISortOption {
  readonly from?: number
  readonly to?: number
  collection_id?: string
  categories?: string[]
}
