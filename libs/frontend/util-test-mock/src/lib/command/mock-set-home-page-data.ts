import { ISetHomePageData } from '@pubstudio/shared/type-command-data'

export const mockSetHomePageData = (
  oldRoute: string,
  newRoute: string,
): ISetHomePageData => {
  const data: ISetHomePageData = {
    oldRoute,
    newRoute,
  }
  return data
}
