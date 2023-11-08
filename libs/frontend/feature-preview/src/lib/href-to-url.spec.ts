import { hrefToUrl } from './href-to-url'

describe('instantiates an URL instance from the given href', () => {
  it('should work when href starts with http', () => {
    const href =
      'http://tmp.com/abc?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C#test-c-1'
    const { pathname, search, hash } = hrefToUrl(href)
    expect(pathname).toEqual('/abc')
    expect(search).toEqual('?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C')
    expect(hash).toEqual('#test-c-1')
  })

  it('should work when href starts with https', () => {
    const href =
      'https://tmp.com/abc?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C#test-c-1'
    const { pathname, search, hash } = hrefToUrl(href)
    expect(pathname).toEqual('/abc')
    expect(search).toEqual('?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C')
    expect(hash).toEqual('#test-c-1')
  })

  it('should work when href starts with www.', () => {
    const href =
      'www.tmp.com/abc?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C#test-c-1'
    const { pathname, search, hash } = hrefToUrl(href)
    expect(pathname).toEqual('/abc')
    expect(search).toEqual('?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C')
    expect(hash).toEqual('#test-c-1')
  })

  it('should work when href is a relative path with leading slash', () => {
    const href = '/abc?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C#test-c-1'
    const { pathname, search, hash } = hrefToUrl(href)
    expect(pathname).toEqual('/abc')
    expect(search).toEqual('?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C')
    expect(hash).toEqual('#test-c-1')
  })

  it('should work when href is a relative path without leading slash', () => {
    const href = 'abc?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C#test-c-1'
    const { pathname, search, hash } = hrefToUrl(href)
    expect(pathname).toEqual('/abc')
    expect(search).toEqual('?a=b&c=d&keyword=%E5%93%88%E5%9B%89%E4%B8%96%E7%95%8C')
    expect(hash).toEqual('#test-c-1')
  })
})
