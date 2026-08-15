import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { deserializedHelper } from '@pubstudio/frontend/util-site-deserialize'
import { ComponentArgPrimitive, ISerializedSite, Tag } from '@pubstudio/shared/type-site'
import { generateSite, renderPageBody } from './generate-site'
import { normalizeSiteInput, parseJsonField } from './normalize-input'
import { ISsgSiteInput } from './ssg-types'

const makeInput = (modify?: (site: ISerializedSite) => void): ISsgSiteInput => {
  const site: ISerializedSite = JSON.parse(JSON.stringify(mockSerializedSite))
  for (const page of Object.values(site.pages)) {
    page.public = true
  }
  modify?.(site)
  return {
    id: 'test-site-id',
    name: site.name,
    version: site.version,
    defaults: JSON.stringify(site.defaults),
    context: JSON.stringify(site.context),
    pages: JSON.stringify(site.pages),
    pageOrder: site.pageOrder ? JSON.stringify(site.pageOrder) : undefined,
    updated_at: '2026-07-01T00:00:00Z',
  }
}

describe('generateSite', () => {
  it('prerenders public pages with styles, payload, and runtime script', async () => {
    const result = await generateSite(makeInput(), {
      baseUrl: 'https://mock.example.com',
    })

    const routes = result.pages.map((p) => p.route)
    expect(routes).toContain('/home')
    expect(routes).toContain('/')
    expect(routes).toContain('/sitemap.xml')
    expect(routes).toContain('/robots.txt')
    expect(result.noJs).toBe(false)
    expect(result.blockers).toEqual([])

    const home = result.pages.find((p) => p.route === '/')
    expect(home?.body).toContain('<div class="global-s-0 test-c-0" id="test-c-0">')
    expect(home?.body).toContain('--color-title:#000000;')
    expect(home?.body).toContain('window.__PUBSTUDIO_SITE__ = ')
    expect(home?.body).toContain('<script defer src="/_ps/site.js"></script>')
    expect(home?.body).toContain('<title>home</title>')
    // Home alias serves the same document as the page route
    const homeRoute = result.pages.find((p) => p.route === '/home')
    expect(home?.body).toEqual(homeRoute?.body)

    const sitemap = result.pages.find((p) => p.route === '/sitemap.xml')
    expect(sitemap?.body).toContain('<loc>https://mock.example.com/</loc>')
  })

  it('excludes private pages from output and payload', async () => {
    const input = makeInput((site) => {
      site.pages['/home'].public = false
    })
    const result = await generateSite(input)
    const routes = result.pages.map((p) => p.route)
    expect(routes).not.toContain('/home')
    expect(routes).not.toContain('/')
    expect(result.warnings.join(' ')).toContain('Home page /home is missing')
  })

  it('omits payload and runtime script with noJs', async () => {
    const result = await generateSite(makeInput(), { noJs: true })
    const home = result.pages.find((p) => p.route === '/')
    expect(result.noJs).toBe(true)
    expect(home?.body).not.toContain('window.__PUBSTUDIO_SITE__')
    expect(home?.body).not.toContain('<script defer')
    // Still contains the prerendered markup
    expect(home?.body).toContain('id="test-c-1"')
  })

  it('emits raw CSS in <style> and neutralizes closing tags', async () => {
    const input = makeInput((site) => {
      site.context.globalStyles = {
        'global-bg': {
          style:
            '.hero{background-image:url(https://img.example.com/p.jpg?w=100&fit=crop);}' +
            '@media (width < 600px){.hero{display:none;}}',
        },
        'global-escape': {
          style: '.x{content:"</style><script>alert(1)</script>";}',
        },
      }
    })
    const result = await generateSite(input)
    const home = result.pages.find((p) => p.route === '/')

    // `<style>` is an HTML raw text element, so an escaped `&` would reach the browser as a
    // literal `&amp;` and corrupt every url() query string
    expect(home?.body).toContain('url(https://img.example.com/p.jpg?w=100&fit=crop)')
    expect(home?.body).not.toContain('&amp;fit=crop')
    // Author CSS may legitimately contain `<`, e.g. range media queries
    expect(home?.body).toContain('@media (width < 600px)')
    // ...but must never be able to close the style element
    // (a bare `<script>` is inert inside raw text -- only `</style` can terminate the element)
    expect(home?.body).not.toContain('</style><script>')
    expect(home?.body).toContain('\\00003c/style>')
    expect(home?.body).toContain('\\00003c/script>')
  })

  it('emits canonical and social tags when the site domain is known', async () => {
    const result = await generateSite(makeInput(), {
      baseUrl: 'https://mock.example.com/',
    })
    const home = result.pages.find((p) => p.route === '/')
    const about = result.pages.find((p) => p.route === '/home')

    // Home is served at both routes, and `/` is the canonical one
    expect(home?.body).toContain(
      '<link rel="canonical" href="https://mock.example.com/" />',
    )
    expect(home?.body).toContain(
      '<meta property="og:url" content="https://mock.example.com/" />',
    )
    expect(home?.body).toContain(
      '<meta property="twitter:url" content="https://mock.example.com/" />',
    )
    expect(about?.body).toEqual(home?.body)
    expect(home?.body).toContain('<meta property="og:type" content="website" />')
    expect(home?.body).toContain(
      '<meta property="twitter:card" content="summary_large_image" />',
    )
  })

  it('omits canonical/url tags when no base url is known, and defers to the site', async () => {
    const noBase = await generateSite(makeInput())
    const noBaseHome = noBase.pages.find((p) => p.route === '/')
    expect(noBaseHome?.body).not.toContain('rel="canonical"')
    expect(noBaseHome?.body).not.toContain('og:url')
    // Page-independent social tags are still emitted
    expect(noBaseHome?.body).toContain('<meta property="og:type" content="website" />')

    const override = await generateSite(
      makeInput((site) => {
        site.defaults.head = { meta: [{ property: 'og:type', content: 'article' }] }
      }),
    )
    const overrideHome = override.pages.find((p) => p.route === '/')
    expect(overrideHome?.body).toContain('<meta property="og:type" content="article" />')
    expect(overrideHome?.body).not.toContain('content="website"')
  })

  it('prerenders custom Vue components as an empty placeholder to hydrate into', async () => {
    const input = makeInput((site) => {
      const child = site.pages['/home'].root.children?.[0]
      if (child) {
        child.tag = Tag.Vue
        child.inputs = {
          componentName: {
            type: ComponentArgPrimitive.String,
            name: 'componentName',
            is: 'MyWidget',
          },
        }
      }
    })
    const result = await generateSite(input)
    const home = result.pages.find((p) => p.route === '/')

    // Without the SSR guard in getOrWaitComponent, Vue emits a comment node that
    // mismatches the `div` the client hydrates
    expect(result.warnings).toEqual([])
    expect(home?.body).toContain('id="test-c-0"><div></div></div>')
    // Custom components need the runtime, so they block noJs output
    expect(result.blockers.join(' ')).toContain('custom Vue component')
  })

  it('reports render errors instead of silently emitting a partial page', async () => {
    const { serialized } = normalizeSiteInput(makeInput())
    const site = deserializedHelper(serialized)
    const page = site.pages['/home']
    // A throwing getter stands in for any setup/render-time failure under SSR
    Object.defineProperty(page.root.children?.[0] ?? {}, 'tag', {
      get: () => {
        throw new Error('boom')
      },
    })

    const errors: string[] = []
    const body = await renderPageBody(site, page, (message) => errors.push(message))

    expect(errors.join(' ')).toContain('boom')
    // Vue swallows the error and emits a placeholder, so the page looks complete otherwise
    expect(body).toContain('<!---->')
  })

  it('refuses noJs when the site has interactive features', async () => {
    const input = makeInput((site) => {
      site.pages['/home'].root.events = {
        click: {
          name: 'click',
          behaviors: [{ behaviorId: 'b-1' }],
        },
      }
    })
    await expect(generateSite(input, { noJs: true })).rejects.toThrow('noJs refused')
    const forced = await generateSite(input, { noJs: true, force: true })
    expect(forced.noJs).toBe(true)
    expect(forced.warnings.join(' ')).toContain('noJs forced')
    expect(forced.blockers.length).toBeGreaterThan(0)
  })
})

describe('parseJsonField', () => {
  it('unwraps objects, JSON strings, and nested JSON strings', () => {
    const obj = { a: 1 }
    expect(parseJsonField(obj)).toEqual(obj)
    expect(parseJsonField(JSON.stringify(obj))).toEqual(obj)
    expect(parseJsonField(JSON.stringify(JSON.stringify(obj)))).toEqual(obj)
    expect(parseJsonField(undefined)).toBeUndefined()
    expect(parseJsonField(null)).toBeUndefined()
  })
})
