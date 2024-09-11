import { ILocationParams, ILocationParts } from './i-location-parts'
import { IRoute } from './i-route'

type ISimpleRoute = Omit<IRoute<unknown>, 'meta'>

export const validateRoute = (route: ISimpleRoute) => {
  const { name, path } = route
  if (!name) {
    throw new Error('Route name cannot be empty')
  } else if (!path) {
    throw new Error(`Path for route with name ${name} cannot be empty`)
  } else if (!path.startsWith('/')) {
    throw new Error(`Path for route with name ${name} must start with /`)
  } else if (path !== '/' && path.endsWith('/')) {
    throw new Error(`Path for route with name ${name} cannot end with /`)
  }
}

export const mergePath = (parentPath: string, childPath: string): string => {
  const parentEndsWithSlash = parentPath.at(-1) === '/'
  const childStartsWithSlash = childPath[0] === '/'

  if (parentEndsWithSlash && childStartsWithSlash) {
    return parentPath + childPath.substring(1)
  } else if (!parentEndsWithSlash && !childStartsWithSlash) {
    return `${parentPath}/${childPath}`
  } else {
    return parentPath + childPath
  }
}

/**
 * Convert path like `/users/:id` to a regex that matches `/users/1`, `/users/1/`,
 * `/users/1?...`, `/users/1#...`, and `/users/1/some-other-chars`.
 */
export const computePathRegex = (path: string): RegExp => {
  const p = path.endsWith('*') ? path.slice(0, path.length - 1) : path
  const sourcePattern = p.replace(/:\w+/g, '[-_\\w]+')
  const pattern = `(${sourcePattern}/?$)|(${sourcePattern}[/?#])`
  return new RegExp(pattern)
}

// Strip path of query and hash
export const stripPath = (path: string): string => {
  const indexOfQuery = path.indexOf('?')
  const indexOfFirstHash = path.indexOf('#')

  if (indexOfQuery > -1 || indexOfFirstHash > -1) {
    let splitAt
    if (indexOfQuery === -1) {
      splitAt = indexOfFirstHash
    } else if (indexOfFirstHash === -1) {
      splitAt = indexOfQuery
    } else {
      splitAt = Math.min(indexOfFirstHash, indexOfQuery)
    }
    return path.substring(0, splitAt)
  } else {
    return path
  }
}

export const computeLocationParts = (
  route: ISimpleRoute,
  path: string,
): ILocationParts => {
  // Compute params
  const params: Record<string, string> = {}

  const sourcePathGroups = route.path.split('/')
  const indexOfQuery = path.indexOf('?')

  const strippedPath = stripPath(path)
  const pathGroups = strippedPath.split('/')

  sourcePathGroups.forEach((rawKey, index) => {
    if (rawKey.startsWith(':')) {
      // Remove the first : character to get param key
      const optional = rawKey.endsWith('?')
      const consume = rawKey.endsWith('*')
      let key: string
      if (optional || consume) {
        key = rawKey.substring(1, rawKey.length - 1)
      } else {
        key = rawKey.substring(1)
      }
      const value = consume ? pathGroups.slice(index).join('/') : pathGroups[index]

      if (!value) {
        throw new Error(`Param ${rawKey} is not present in ${path}`)
      }
      params[key] = value
    }
  })

  // Compute query
  const query: Record<string, string | string[] | undefined> = {}

  const lastIndexOfHash = path.lastIndexOf('#')

  if (indexOfQuery > 0) {
    const end = lastIndexOfHash > 0 ? lastIndexOfHash : undefined
    const queryString = path.substring(indexOfQuery, end)
    const searchParams = new URLSearchParams(queryString)

    for (const key of searchParams.keys()) {
      if (query[key] === undefined) {
        // Filter out empty string
        const values = searchParams.getAll(key).filter((value) => value)
        const { length } = values
        if (length === 0) {
          continue
        } else if (length === 1) {
          query[key] = values[0]
        } else {
          query[key] = values
        }
      }
    }
  }

  // Compute hash
  let hash = ''
  if (lastIndexOfHash > 0) {
    hash = path.substring(lastIndexOfHash)
  }

  return {
    params,
    query,
    hash,
  }
}

export const replaceParams = (
  path: string,
  params: ILocationParams | undefined,
): string => {
  let replaced = path
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        replaced = path.replace(new RegExp(`:${key}[*]?`), value)
      }
    })
  }
  return replaced
}

export const computeResolvedPath = (
  path: string | undefined,
  locationParts: Partial<ILocationParts>,
): string => {
  const { params, query, hash } = locationParts
  let resolvedPath = replaceParams(path ?? '', params)

  if (query) {
    const keyValuePairs = Object.entries(query).map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((val) => `${key}=${encodeURIComponent(val)}`).join('&')
      } else {
        return `${key}=${encodeURIComponent(value as string)}`
      }
    })
    const queryString = keyValuePairs.join('&')
    if (queryString) {
      resolvedPath += `?${queryString}`
    }
  }

  if (hash) {
    resolvedPath += hash
  }

  return resolvedPath
}

export const getCurrentPath = (): string => {
  const { pathname, search, hash } = window.location
  return `${pathname}${search}${hash}`
}
