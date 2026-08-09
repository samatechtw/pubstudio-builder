import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISerializedSite } from '@pubstudio/shared/type-site'
import { generateSite } from './generate-site'
import { parseJsonField } from './normalize-input'
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
