import { IRenderSiteHead } from '@pubstudio/frontend/feature-render'
import { IHeadLink, IHeadMeta, IHeadScript } from '@pubstudio/shared/type-site'
import { BASE_PAGE_CSS } from './base-css'
import { SSG_GENERATOR } from './ssg-types'

const escapeAttr = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const escapeText = (value: string): string => {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

type HeadTagAttrs = IHeadMeta | IHeadLink | IHeadScript

const tagAttrs = (attrs: HeadTagAttrs): string => {
  return Object.entries(attrs)
    .map(([name, value]) => {
      // `key` is a Vue dedup hint added by getHead, not an HTML attribute
      if (value === undefined || value === null || value === false || name === 'key') {
        return ''
      }
      return value === true ? ` ${name}` : ` ${name}="${escapeAttr(String(value))}"`
    })
    .join('')
}

// Default favicon to avoid /favicon.ico requests when the site has no icon configured
const DEFAULT_FAVICON: IHeadLink = {
  rel: 'icon',
  type: 'image/png',
  href: 'data:image/png;base64,iVBORw0KGgo=',
}

// Social tags not produced by `getHead`. Only crawlers see these (client renders
// head from `getHead`), so emit here instead of the shared renderer.
const socialMeta = (head: IRenderSiteHead, canonicalUrl?: string): IHeadMeta[] => {
  const defined = new Set(head.meta.map((m) => m.property ?? m.name))
  const tags: IHeadMeta[] = [
    { property: 'og:type', content: 'website' },
    { property: 'twitter:card', content: 'summary_large_image' },
  ]
  if (canonicalUrl) {
    tags.push({ property: 'og:url', content: canonicalUrl })
    tags.push({ property: 'twitter:url', content: canonicalUrl })
  }
  return tags.filter((t) => !defined.has(t.property))
}

export interface IHtmlPageOptions {
  lang: string
  head: IRenderSiteHead
  bodyHtml: string
  // Absolute URL of this page, when the site's domain is known
  canonicalUrl?: string
  // JSON payload for `window.__PUBSTUDIO_SITE__`; omitted under noJs
  payloadJson?: string
  runtimeSrc?: string
}

export const buildHtmlPage = (options: IHtmlPageOptions): string => {
  const { lang, head, bodyHtml, canonicalUrl, payloadJson, runtimeSrc } = options
  const links = [...head.link]
  if (!links.some((l) => l.rel === 'icon')) {
    links.unshift(DEFAULT_FAVICON)
  }
  if (canonicalUrl && !links.some((l) => l.rel === 'canonical')) {
    links.push({ rel: 'canonical', href: canonicalUrl })
  }
  const headLines = [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width,initial-scale=1.0" />',
    `<meta name="generator" content="${SSG_GENERATOR}" />`,
    `<title>${escapeText(head.title)}</title>`,
    ...head.meta.map((meta) => `<meta${tagAttrs(meta)} />`),
    ...socialMeta(head, canonicalUrl).map((meta) => `<meta${tagAttrs(meta)} />`),
    ...links.map((link) => `<link${tagAttrs(link)} />`),
    ...head.script.map((script) => `<script${tagAttrs(script)}></script>`),
    `<style>${BASE_PAGE_CSS}</style>`,
  ]
  const bodyLines = [`<div id="app">${bodyHtml}</div>`]
  if (payloadJson && runtimeSrc) {
    // Escape `<` so `</script>` inside the JSON cannot close the tag early
    const safePayload = payloadJson.replace(/</g, '\\u003c')
    // ___SITE_API_URL___ is substituted by platform-api when it serves the page.
    // site-api serves it raw and the hydration runtime falls back to the same-origin API
    bodyLines.push(
      `<script>window.__PUBSTUDIO_SITE_API__ = '___SITE_API_URL___';` +
        `window.__PUBSTUDIO_SITE__ = ${safePayload}</script>`,
    )
    bodyLines.push(`<script defer src="${escapeAttr(runtimeSrc)}"></script>`)
  }
  return [
    '<!doctype html>',
    `<html lang="${escapeAttr(lang)}">`,
    '<head>',
    ...headLines,
    '</head>',
    '<body>',
    ...bodyLines,
    '</body>',
    '</html>',
  ].join('\n')
}
