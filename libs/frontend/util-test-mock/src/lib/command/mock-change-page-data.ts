import { IChangePageData } from '@pubstudio/shared/type-command-data'

export const mockChangePageData = (
  from: string,
  to: string,
  selectedComponentId: string | undefined,
): IChangePageData => {
  return {
    from,
    to,
    selectedComponentId,
  }
}
