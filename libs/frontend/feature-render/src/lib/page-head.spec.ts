// @vitest-environment happy-dom
import { Window } from 'happy-dom'
import { IHead, IPage, ISite } from '@pubstudio/shared/type-site'
import { replaceHead } from './page-head'

const page = (head: IHead) => ({ name: 'Test', public: true, head }) as IPage
const site = { defaults: { head: {} } } as ISite

beforeEach(() => {
  ;(window as unknown as Window).happyDOM.settings.handleDisabledFileLoadingAsSuccess =
    true
})

afterEach(() => {
  document.head.innerHTML = ''
})

describe('page scripts', () => {
  it('defaults to ordered execution and handles boolean attributes', () => {
    replaceHead(
      site,
      page({
        script: [
          { src: '/dependency.js' },
          { src: '/component.js', async: false },
          { src: '/analytics.js', async: true },
        ],
      }),
      undefined,
    )
    const scripts = Array.from(document.scripts)
    expect(scripts.map((s) => s.async)).toEqual([false, false, true])
    expect(scripts[1].hasAttribute('async')).toBe(false)
    expect(scripts[2].getAttribute('async')).toBe('')
  })

  it('reuses prerendered links and avoids duplicate scripts on repeated initialization', () => {
    document.head.innerHTML = '<link rel="icon" href="/icon.png">'
    const current = page({
      link: [{ rel: 'icon', href: '/icon.png' }],
      script: [{ src: "/component's.js", async: false }],
    })
    replaceHead(site, current, undefined)
    replaceHead(site, current, undefined)
    expect(document.querySelectorAll('link')).toHaveLength(1)
    expect(document.scripts).toHaveLength(1)
    replaceHead(site, page({}), current)
    expect(document.scripts).toHaveLength(0)
  })
})
