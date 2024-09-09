import { RenderMode } from '@pubstudio/frontend/util-render'
import { hrefToUrl, INormalizedUrl } from '@pubstudio/frontend/util-router'
import { mergeSearch } from './merge-search'

export const routeToPreviewPath = (
  route: string,
  renderMode: RenderMode,
): INormalizedUrl => {
  const pathPrefix = renderMode === RenderMode.PreviewEmbed ? '/' : '/preview'
  const { url, isExternal } = hrefToUrl(route, pathPrefix)
  if (isExternal) {
    return { url, isExternal }
  }

  // Relative path, forward query string and hash.

  // Since users may provide href with custom hash and query, we have to extract those values
  // from the `href` prop and merge them with editor hash and query. User-provided hash&query
  // will take precedence over editor hash&query.

  const { pathname: previewPathName, search: userSearch, hash: userHash } = new URL(url)
  const { search: editorSearch, hash: editorHash } = window.location

  const mergedSearchParams = mergeSearch(editorSearch, userSearch)
  const uniqueSearchKeys = new Set(mergedSearchParams.keys())

  let queryString = ''

  const queryParams = Array.from(uniqueSearchKeys).flatMap((key) => {
    const values = mergedSearchParams.getAll(key)
    return values.map((value) => `${key}=${value}`)
  })

  if (queryParams.length) {
    queryString = `?${queryParams.join('&')}`
  }
  return {
    url: `${previewPathName}${queryString}${userHash || editorHash}`,
    isExternal,
  }
}
