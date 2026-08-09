import { ISite } from '@pubstudio/shared/type-site'

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
}

export const emitSitemap = (
  site: ISite,
  baseUrl: string,
  lastmod?: string | number | null,
): string => {
  const origin = baseUrl.replace(/\/+$/, '')
  const routes: string[] = []
  for (const route of site.pageOrder) {
    const page = site.pages[route]
    if (!page?.public || page.route === '/not-found') {
      continue
    }
    routes.push(page.route === site.defaults.homePage ? '/' : page.route)
  }
  const lastmodTag = lastmod
    ? `<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>`
    : ''
  const urls = routes
    .map((route) => `<url><loc>${escapeXml(origin + route)}</loc>${lastmodTag}</url>`)
    .join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}

export const emitRobots = (baseUrl?: string): string => {
  const lines = ['User-agent: *', 'Allow: /']
  if (baseUrl) {
    lines.push(`Sitemap: ${baseUrl.replace(/\/+$/, '')}/sitemap.xml`)
  }
  lines.push('')
  return lines.join('\n')
}
