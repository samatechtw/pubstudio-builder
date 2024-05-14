interface INormalizedUrl {
  url: string
  isExternal: boolean
}

export const hrefToUrl = (href: string, pathname = '/'): INormalizedUrl => {
  // URL class expects href to starts with either http or https, so we have to
  // generate a url that starts with http or https based on the given href.
  let finalUrl = ''

  const { url, isExternal } = normalizeUrl(href)
  if (!pathname.startsWith('/')) {
    throw new Error('pathname must start with /')
  } else if (isExternal) {
    finalUrl = url
  } else {
    // Avoid urls with double slash after host. For example, https://tmp//my-page
    const path = pathname === '/' ? '' : pathname
    if (href.startsWith('/')) {
      finalUrl = `https://tmp${path}${href}`
    } else {
      finalUrl = `https://tmp${path}/${href}`
    }
  }

  return { url: finalUrl, isExternal }
}

export const normalizeUrl = (href: string): INormalizedUrl => {
  if (href.startsWith('www.')) {
    return { url: `https://${href}`, isExternal: true }
  } else if (isExternalUrl(href)) {
    return { url: href, isExternal: true }
  }
  return { url: href, isExternal: false }
}

export const isExternalUrl = (href: string): boolean => {
  return /^(https?:|www|mailto:|tel:|sms:)/.test(href)
}
