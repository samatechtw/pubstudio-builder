import { resolveSiteServerAddress } from './site-api-address'

describe('resolveSiteServerAddress', () => {
  it('rewrites cluster addresses to the local host, keeping the port', () => {
    expect(resolveSiteServerAddress('http://site-api1:3100')).toEqual(
      'http://127.0.0.1:3100',
    )
    expect(resolveSiteServerAddress('http://site-api2:3110')).toEqual(
      'http://127.0.0.1:3110',
    )
  })

  it('rewrites a cluster address without a port', () => {
    expect(resolveSiteServerAddress('http://site-api1')).toEqual('http://127.0.0.1')
  })

  it('leaves real addresses untouched', () => {
    expect(resolveSiteServerAddress('http://sites2.dev.pubstud.io')).toEqual(
      'http://sites2.dev.pubstud.io',
    )
    expect(resolveSiteServerAddress('https://sites1.pubstud.io')).toEqual(
      'https://sites1.pubstud.io',
    )
  })

  it('does not rewrite addresses that merely contain the cluster name', () => {
    expect(resolveSiteServerAddress('https://site-api1.pubstud.io')).toEqual(
      'https://site-api1.pubstud.io',
    )
    expect(resolveSiteServerAddress('http://site-api1:3100/api')).toEqual(
      'http://site-api1:3100/api',
    )
  })
})

describe('resolveSiteServerAddress with VITE_DEV_SITE_API_MAP', () => {
  const withMap = async (map: string) => {
    vi.stubEnv('VITE_DEV_SITE_API_MAP', map)
    vi.resetModules()
    return (await import('./site-api-address')).resolveSiteServerAddress
  }

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses an explicit mapping, including a different scheme and port', async () => {
    const resolve = await withMap(
      'http://site-api1:3100=https://dev.example.com:4100,' +
        'http://site-api2:3110=https://dev.example.com:4110',
    )
    expect(resolve('http://site-api1:3100')).toEqual('https://dev.example.com:4100')
    expect(resolve('http://site-api2:3110')).toEqual('https://dev.example.com:4110')
  })

  it('strips a trailing slash from the mapped address', async () => {
    const resolve = await withMap('http://site-api1:3100=https://dev.example.com:4100/')
    expect(resolve('http://site-api1:3100')).toEqual('https://dev.example.com:4100')
  })

  it('falls back to the host swap for unmapped cluster addresses', async () => {
    const resolve = await withMap('http://site-api1:3100=https://dev.example.com:4100')
    expect(resolve('http://site-api2:3110')).toEqual('http://127.0.0.1:3110')
    expect(resolve('http://sites2.dev.pubstud.io')).toEqual(
      'http://sites2.dev.pubstud.io',
    )
  })

  it('ignores malformed entries', async () => {
    const resolve = await withMap(
      'nonsense,,http://site-api1:3100=https://dev.example.com:4100',
    )
    expect(resolve('http://site-api1:3100')).toEqual('https://dev.example.com:4100')
  })
})
