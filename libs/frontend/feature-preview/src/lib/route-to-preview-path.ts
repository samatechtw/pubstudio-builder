import { RenderMode } from '@pubstudio/frontend/util-render'
import { hrefToUrl, INormalizedUrl } from '@pubstudio/frontend/util-router'
import { mergeSearch, pathToSearchParams } from './merge-search'

export const routeToPreviewRawPath = (
  route: string,
  renderMode: RenderMode,
): INormalizedUrl => {
  const pathPrefix = renderMode === RenderMode.PreviewEmbed ? '/' : '/preview'
  return hrefToUrl(route, pathPrefix)
}

export const routeToPreviewPath = (
  route: string,
  renderMode: RenderMode,
  extraQuery?: string[],
): INormalizedUrl => {
  const { url, isExternal } = routeToPreviewRawPath(route, renderMode)
  if (isExternal) {
    return { url, isExternal }
  }

  // Relative path, forward query string and hash necessary for preview functionality.

  // Since users may provide href with custom hash and query, we have to extract those values
  // from the `href` prop and merge them with editor hash and query. User-provided hash&query
  // will take precedence over editor hash&query.

  const { pathname: previewPathName, search: userSearch, hash: userHash } = new URL(url)
  const { search: editorSearch } = window.location

  const userParams = pathToSearchParams(userSearch)
  const mergedSearchParams = mergeSearch(editorSearch, userSearch)
  const uniqueSearchKeys = new Set(['siteId', ...userParams.keys()])

  let queryString = ''

  const queryParams = Array.from(uniqueSearchKeys).flatMap((key) => {
    const values = mergedSearchParams.getAll(key)
    return values.map((value) => `${key}=${value}`)
  })

  if (queryParams.length) {
    queryString = `?${[...(extraQuery ?? []), ...queryParams].join('&')}`
  }
  return {
    url: `${previewPathName}${queryString}${userHash || ''}`,
    isExternal,
  }
}
