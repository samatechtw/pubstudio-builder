import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISetPageHeadData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applySetPageHead, undoSetPageHead } from './set-page-head'

describe('Set Page Head', () => {
  let siteString: string
  let site: ISite
  let newFavicon: string
  let data: ISetPageHeadData
  const route = '/home'

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    newFavicon = 'https://mysite/cool-favicon.png'
    data = {
      route,
      tag: 'link',
      index: 0,
      newValue: {
        href: newFavicon,
        rel: 'icon',
      },
    }
    // Set favicon
    applySetPageHead(site, data)
    expect(site.pages[route]?.head.link?.[0]).toEqual(data.newValue)
  })

  it('should undo added favicon', () => {
    undoSetPageHead(site, data)
    // Assert favicon is removed
    expect(site.pages[route]?.head.link).toBeUndefined()
  })

  it('should remove favicon', () => {
    // Remove favicon
    data = {
      route,
      tag: 'link',
      index: 0,
      oldValue: {
        href: newFavicon,
        rel: 'icon',
      },
    }
    applySetPageHead(site, data)
    expect(site.pages[route]?.head.link).toBeUndefined()

    undoSetPageHead(site, data)
    // Assert favicon is removed
    expect(site.pages[route]?.head.link?.[0]).toEqual(data.oldValue)
  })

  it('should update favicon', () => {
    const oldValue = data.newValue
    const newValue = {
      href: 'https://mysite/new-favicon.ico',
      rel: 'icon',
    }
    // Remove favicon
    data = {
      route,
      tag: 'link',
      index: 0,
      oldValue,
      newValue,
    }
    applySetPageHead(site, data)
    // Assert favicon is changed
    expect(site.pages[route]?.head.link?.[0]).toEqual(newValue)

    // Asset favicon is changed back
    undoSetPageHead(site, data)
    expect(site.pages[route]?.head.link?.[0]).toEqual(oldValue)
  })

  describe('multiple items in head meta array', () => {
    let data1: ISetPageHeadData
    let data2: ISetPageHeadData
    let data3: ISetPageHeadData

    beforeEach(() => {
      data1 = {
        route,
        tag: 'meta',
        index: 0,
        newValue: {
          property: 'og:title',
          content: 'PubStudio Example',
        },
      }
      applySetPageHead(site, data1)
      data2 = {
        route,
        tag: 'meta',
        index: 1,
        newValue: {
          property: 'og:url',
          content: 'https://library-example.pubstud.io',
        },
      }
      applySetPageHead(site, data2)
      data3 = {
        route,
        tag: 'meta',
        index: 2,
        newValue: {
          property: 'og:type',
          content: 'pubstudio-library-example:site',
        },
      }
      applySetPageHead(site, data3)
      expect(site.pages[route]?.head.meta?.length).toEqual(3)
    })

    it('removes multiple items in meta array', () => {
      const remove1 = {
        route,
        tag: 'meta',
        index: 2,
        oldValue: data3.newValue,
      }
      // Remove last
      applySetPageHead(site, remove1)
      expect(site.pages[route]?.head.meta?.length).toEqual(2)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data2.newValue)

      // Remove first
      const remove2 = {
        route,
        tag: 'meta',
        index: 0,
        oldValue: data1.newValue,
      }
      applySetPageHead(site, remove2)
      expect(site.pages[route]?.head.meta?.length).toEqual(1)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data2.newValue)

      // Remove remaining
      const remove3 = {
        route,
        tag: 'meta',
        index: 0,
        oldValue: data2.newValue,
      }
      applySetPageHead(site, remove3)
      expect(site.pages[route]?.head.meta?.length).toBeUndefined()

      // Undo all
      undoSetPageHead(site, remove3)
      expect(site.pages[route]?.head.meta?.length).toEqual(1)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data2.newValue)

      undoSetPageHead(site, remove2)
      expect(site.pages[route]?.head.meta?.length).toEqual(2)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data2.newValue)

      undoSetPageHead(site, remove1)
      expect(site.pages[route]?.head.meta?.length).toEqual(3)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data2.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(data3.newValue)
    })

    it('adds multiple items in meta array', () => {
      // Add to start
      const add1 = {
        route,
        tag: 'meta',
        index: 0,
        newValue: {
          property: 'twitter:card',
          content: 'summary_large_image',
        },
      }
      applySetPageHead(site, add1)
      expect(site.pages[route]?.head.meta?.length).toEqual(4)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(add1.newValue)

      // Add to end
      const add2 = {
        route,
        tag: 'meta',
        index: 4,
        newValue: {
          property: 'twitter:title',
          content: 'PubStudio Example',
        },
      }
      applySetPageHead(site, add2)
      expect(site.pages[route]?.head.meta?.length).toEqual(5)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(add1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(data2.newValue)
      expect(site.pages[route]?.head.meta?.[3]).toEqual(data3.newValue)
      expect(site.pages[route]?.head.meta?.[4]).toEqual(add2.newValue)

      // Add to middle
      const add3 = {
        route,
        tag: 'meta',
        index: 2,
        newValue: {
          property: 'twitter:url',
          content: 'https://library-examplepubstud.io',
        },
      }
      applySetPageHead(site, add3)
      expect(site.pages[route]?.head.meta?.length).toEqual(6)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(add1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(add3.newValue)
      expect(site.pages[route]?.head.meta?.[3]).toEqual(data2.newValue)
      expect(site.pages[route]?.head.meta?.[4]).toEqual(data3.newValue)
      expect(site.pages[route]?.head.meta?.[5]).toEqual(add2.newValue)

      // Undo all
      undoSetPageHead(site, add3)
      expect(site.pages[route]?.head.meta?.length).toEqual(5)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(add1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(data2.newValue)
      expect(site.pages[route]?.head.meta?.[3]).toEqual(data3.newValue)
      expect(site.pages[route]?.head.meta?.[4]).toEqual(add2.newValue)

      undoSetPageHead(site, add2)
      expect(site.pages[route]?.head.meta?.length).toEqual(4)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(add1.newValue)

      undoSetPageHead(site, add1)
      expect(site.pages[route]?.head.meta?.length).toEqual(3)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data2.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(data3.newValue)
    })

    it('updates multiple items in meta array', () => {
      // Update first
      const update1 = {
        route,
        tag: 'meta',
        index: 0,
        oldValue: data1.newValue,
        newValue: {
          href: 'newlink1',
          rel: 'icon',
        },
      }
      applySetPageHead(site, update1)
      expect(site.pages[route]?.head.meta?.length).toEqual(3)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(update1.newValue)

      // Update second
      const update2 = {
        route,
        tag: 'meta',
        index: 1,
        oldValue: data2.newValue,
        newValue: {
          href: 'newlink2',
          rel: 'icon',
        },
      }
      applySetPageHead(site, update2)
      expect(site.pages[route]?.head.meta?.length).toEqual(3)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(update2.newValue)

      // Update second
      const update3 = {
        route,
        tag: 'meta',
        index: 2,
        oldValue: data3.newValue,
        newValue: {
          href: 'newlink3',
          rel: 'icon',
        },
      }
      applySetPageHead(site, update3)
      expect(site.pages[route]?.head.meta?.length).toEqual(3)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(update3.newValue)

      // Undo all
      undoSetPageHead(site, update3)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(update2.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(data3.newValue)

      undoSetPageHead(site, update2)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(update1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data2.newValue)

      undoSetPageHead(site, update1)
      expect(site.pages[route]?.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.pages[route]?.head.meta?.[1]).toEqual(data2.newValue)
      expect(site.pages[route]?.head.meta?.[2]).toEqual(data3.newValue)
    })
  })
})
