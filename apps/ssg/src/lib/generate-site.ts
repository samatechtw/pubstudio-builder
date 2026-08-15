import { createStaticSiteApp, getHead } from '@pubstudio/frontend/feature-render'
import { setCssValidation } from '@pubstudio/frontend/util-render'
import { deserializedHelper } from '@pubstudio/frontend/util-site-deserialize'
import { IPage, ISite, IStaticSitePayload } from '@pubstudio/shared/type-site'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, shallowRef } from 'vue'
import { detectNoJsBlockers } from './detect-capabilities'
import { emitRobots, emitSitemap } from './emit-sitemap'
import { buildHtmlPage } from './html-page'
import { normalizeSiteInput } from './normalize-input'
import {
  DEFAULT_RUNTIME_SRC,
  ISsgOptions,
  ISsgResult,
  ISsgSiteInput,
  IStaticPage,
  SSG_GENERATOR,
} from './ssg-types'

export const renderPageBody = async (
  site: ISite,
  page: IPage,
  // Vue catches errors thrown in setup/render and renders the subtree as a comment node, so
  // without this a partially rendered page is indistinguishable from a complete one
  onError?: (message: string) => void,
): Promise<string> => {
  const siteRef = shallowRef(site)
  const pageRef = shallowRef<IPage | undefined>(page)
  const { App } = createStaticSiteApp(siteRef, pageRef)
  const app = createSSRApp(App)
  if (onError) {
    app.config.errorHandler = (err) => {
      onError(err instanceof Error ? err.message : String(err))
    }
  }
  return renderToString(app)
}

export const generateSite = async (
  input: ISsgSiteInput,
  options: ISsgOptions = {},
): Promise<ISsgResult> => {
  // The prerendered <style> text must match the hydrating client's output;
  // both sides skip CSS.supports validation (unavailable in Node anyway)
  setCssValidation(false)

  const { serialized, publicPages } = normalizeSiteInput(input)
  const site = deserializedHelper(serialized)
  const warnings: string[] = []
  const blockers = detectNoJsBlockers(site)

  let noJs = false
  if (options.noJs) {
    if (blockers.length === 0) {
      noJs = true
    } else if (options.force) {
      noJs = true
      warnings.push(
        `noJs forced with interactive features that will not work: ${blockers.join('; ')}`,
      )
    } else {
      throw new Error(
        `noJs refused, the site has interactive features: ${blockers.join('; ')}`,
      )
    }
  }

  // The hydration payload is single-encoded JSON, which must match what the
  // hydration runtime passes to unstoreSite.
  const payload: IStaticSitePayload = {
    id: input.id,
    name: serialized.name,
    version: serialized.version,
    defaults: JSON.stringify(serialized.defaults),
    context: JSON.stringify(serialized.context),
    pages: JSON.stringify(serialized.pages),
    pageOrder: JSON.stringify(serialized.pageOrder),
  }
  const payloadJson = noJs ? undefined : JSON.stringify(payload)
  const runtimeSrc = options.runtimeSrc ?? DEFAULT_RUNTIME_SRC

  const lang = site.context.activeI18n ?? 'en'
  const origin = options.baseUrl?.replace(/\/$/, '')
  const canonical = (route: string) => (origin ? `${origin}${route}` : undefined)
  const pages: IStaticPage[] = []
  let homeGenerated = false

  for (const route of Object.keys(publicPages)) {
    const page = site.pages[route]
    if (!page) {
      warnings.push(`Page not found after deserialization: ${route}`)
      continue
    }
    const bodyHtml = await renderPageBody(site, page, (message) =>
      warnings.push(`Render error on ${page.route}: ${message}`),
    )
    const head = getHead(site, page)
    const isHome = page.route === site.defaults.homePage
    // The home page is served at both its route and `/`; `/` is the canonical one
    const html = buildHtmlPage({
      lang,
      head,
      bodyHtml,
      canonicalUrl: canonical(isHome ? '/' : page.route),
      payloadJson,
      runtimeSrc,
    })
    pages.push({ route: page.route, body: html, contentType: 'text/html' })
    if (isHome) {
      pages.push({ route: '/', body: html, contentType: 'text/html' })
      homeGenerated = true
    }
  }
  if (!homeGenerated) {
    warnings.push(`Home page ${site.defaults.homePage} is missing or not public`)
  }

  if (options.baseUrl) {
    pages.push({
      route: '/sitemap.xml',
      body: emitSitemap(site, options.baseUrl, input.updated_at),
      contentType: 'application/xml',
    })
  }
  pages.push({
    route: '/robots.txt',
    body: emitRobots(options.baseUrl),
    contentType: 'text/plain',
  })

  return {
    pages,
    blockers,
    warnings,
    noJs,
    siteVersion: serialized.version,
    updatedAt: input.updated_at,
    generator: SSG_GENERATOR,
  }
}
