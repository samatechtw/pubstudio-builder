import { DEV_SITE_API_HOST, DEV_SITE_API_MAP } from './config-env'

// In dev/CI the Site API servers are seeded with cluster-internal addresses
// (http://site-api1:3100), which a browser can't resolve.
// Real addresses (sites2.dev.pubstud.io) don't match and are returned as-is.
const CLUSTER_ADDRESS_RE = /^(https?:\/\/)site-api\d+(:\d+)?$/

// Explicit overrides for setups where swapping the hostname isn't enough. A reverse proxy
// that terminates TLS and listens on a different port, say. Format is a comma-separated list
// of `<cluster address>=<address the browser should use>`, e.g.
//  http://site-api1:3100=https://dev.example.com:4100,http://site-api2:3110=...
const parseAddressMap = (raw: string): Record<string, string> =>
  Object.fromEntries(
    raw
      .split(',')
      .map((entry) => {
        const separator = entry.indexOf('=')
        return [
          entry.slice(0, separator).trim(),
          entry
            .slice(separator + 1)
            .trim()
            .replace(/\/+$/, ''),
        ]
      })
      .filter(([from, to]) => from && to),
  )

const addressMap = DEV_SITE_API_MAP ? parseAddressMap(DEV_SITE_API_MAP) : {}

export const resolveSiteServerAddress = (address: string): string =>
  addressMap[address] ?? address.replace(CLUSTER_ADDRESS_RE, `$1${DEV_SITE_API_HOST}$2`)
