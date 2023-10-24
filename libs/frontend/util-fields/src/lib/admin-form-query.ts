import { arrayToQuery } from '@pubstudio/shared/util-format'
import { onBeforeMount, watch } from 'vue'
import { useRoute } from '@pubstudio/frontend/util-router'
import { IAdminForm } from './i-admin-fields'

export interface IAdminFormQueryOptions {
  form: IAdminForm
}

type QueryEntry = [string, string | string[]]

export const useAdminFormQuery = (form: IAdminForm): void => {
  const route = useRoute()

  const initValuesFromQueryString = () => {
    // Filter out unknown or empty params
    const allowedQueries = Object.entries(route.value?.query ?? {}).filter(
      ([key, value]) => key in form && value,
    )

    for (const [key, value] of allowedQueries) {
      const field = form[key]
      const fieldExpectsArray = Array.isArray(field.input)
      const valueIsArray = Array.isArray(value)

      // Update fields
      if ('checked' in field) {
        field.checked = value === '1' || value === 'true'
      } else if (fieldExpectsArray && !valueIsArray) {
        field.input = [value as string]
      } else if (!fieldExpectsArray && valueIsArray) {
        field.input = (value as string[])[0] || ''
      } else if (value !== 'null') {
        field.input = value as string | string[]
      }
    }

    // Remove unallowed params from URL
    replaceUrl(allowedQueries as QueryEntry[])
  }

  onBeforeMount(() => {
    initValuesFromQueryString()
  })

  /**
   * Replace query string in URL without reloading page
   */
  const replaceUrl = (queryEntries: QueryEntry[]): void => {
    const queryString = entriesToQueryString(queryEntries)
    const fullUrl = route.value?.path + '?' + queryString
    history.replaceState({}, '', fullUrl)
  }

  const entriesToQueryString = (entries: QueryEntry[]): string => {
    // An array of strings ['key=value','key=value'...]
    const pairs: string[] = []

    // Convert each entry to string 'key=value'
    for (const [key, value] of entries) {
      if (value === null) {
        // Skip null filter values
      } else if (Array.isArray(value)) {
        if (value.length) {
          pairs.push(arrayToQuery(key, value))
        }
      } else if (typeof value === 'object') {
        pairs.push(`${key}=${encodeURIComponent(JSON.stringify(value))}`)
      } else {
        pairs.push(`${key}=${encodeURIComponent(value)}`)
      }
    }

    // Returns 'key=value&key=value&...&key=value'
    return pairs.join('&')
  }

  watch(
    () => form,
    (value) => {
      const queryEntries = Object.entries(value)
        .filter(([, field]) => field.input !== undefined && field.input !== '')
        .map(([key, field]) => [key, field.input] as QueryEntry)

      replaceUrl(queryEntries)
    },
    {
      deep: true,
    },
  )
}
