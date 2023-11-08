export const hrefToUrl = (href: string, pathname: string = '/'): URL => {
  // URL class expects href to starts with either http or https, so we have to
  // generate a url that starts with http or https based on the given href.
  let url = ''

  if (!pathname.startsWith('/')) {
    throw new Error('pathname must starts with /')
  } else if (href.startsWith('http')) {
    url = href
  } else if (href.startsWith('www.')) {
    url = `https://${href}`
  } else {
    // Avoid urls with double slash after host. For example, https://tmp//my-page
    const path = pathname === '/' ? '' : pathname
    if (href.startsWith('/')) {
      url = `https://tmp${path}${href}`
    } else {
      url = `https://tmp${path}/${href}`
    }
  }

  return new URL(url)
}
