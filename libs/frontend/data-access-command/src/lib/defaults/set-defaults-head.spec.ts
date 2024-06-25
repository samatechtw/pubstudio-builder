import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISetDefaultsHeadData } from '@pubstudio/shared/type-command-data'
import { IHeadBase, ISite } from '@pubstudio/shared/type-site'
import { applySetDefaultsHead, undoSetDefaultsHead } from './set-defaults-head'

describe('Set Defaults Head', () => {
  let siteString: string
  let site: ISite
  let newFavicon: string
  let data: ISetDefaultsHeadData

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    newFavicon = 'https://mysite/cool-favicon.png'
    data = {
      tag: 'link',
      index: 0,
      newValue: {
        href: newFavicon,
        rel: 'icon',
      },
    }
    // Set favicon
    applySetDefaultsHead(site, data)
    expect(site.defaults.head.link?.[0]).toEqual(data.newValue)
  })

  it('should undo added favicon', () => {
    undoSetDefaultsHead(site, data)
    // Assert favicon is removed
    expect(site.defaults.head.link).toBeUndefined()
  })

  it('should remove favicon', () => {
    // Remove favicon
    data = {
      tag: 'link',
      index: 0,
      oldValue: {
        href: newFavicon,
        rel: 'icon',
      },
    }
    applySetDefaultsHead(site, data)
    expect(site.defaults.head.link).toBeUndefined()

    undoSetDefaultsHead(site, data)
    // Assert favicon is removed
    expect(site.defaults.head.link?.[0]).toEqual(data.oldValue)
  })

  it('should update favicon', () => {
    const oldValue = data.newValue
    const newValue = {
      href: 'https://mysite/new-favicon.ico',
      rel: 'icon',
    }
    // Remove favicon
    data = {
      tag: 'link',
      index: 0,
      oldValue,
      newValue,
    }
    applySetDefaultsHead(site, data)
    // Assert favicon is changed
    expect(site.defaults.head.link?.[0]).toEqual(newValue)

    // Asset favicon is changed back
    undoSetDefaultsHead(site, data)
    expect(site.defaults.head.link?.[0]).toEqual(oldValue)
  })

  it('should add, set, and remove base', () => {
    const newValue: IHeadBase = {
      href: 'https://mysite.com',
      target: '_blank',
    }
    const addData: ISetDefaultsHeadData = {
      tag: 'base',
      index: 0,
      newValue,
    }
    applySetDefaultsHead(site, addData)
    // Assert base is added
    expect(site.defaults.head.base).toEqual(newValue)

    const updatedValue = {
      href: 'https://anothersite.com',
    }
    const updateData: ISetDefaultsHeadData = {
      tag: 'base',
      index: 0,
      oldValue: newValue,
      newValue: updatedValue,
    }
    // Assert base is updated
    applySetDefaultsHead(site, updateData)
    expect(site.defaults.head.base).toEqual(updatedValue)

    const removeData: ISetDefaultsHeadData = {
      tag: 'base',
      index: 0,
      oldValue: updatedValue,
      newValue: undefined,
    }
    applySetDefaultsHead(site, removeData)
    // Assert base is removed
    expect(site.defaults.head.base).toBeUndefined()

    // Undo all
    undoSetDefaultsHead(site, removeData)
    expect(site.defaults.head.base).toEqual(updatedValue)
    undoSetDefaultsHead(site, updateData)
    expect(site.defaults.head.base).toEqual(newValue)
    undoSetDefaultsHead(site, addData)
    expect(site.defaults.head.base).toBeUndefined()
  })

  it('should add, set, and remove title', () => {
    const newValue = 'NEWTITLE'
    const addData: ISetDefaultsHeadData = {
      tag: 'title',
      index: 0,
      newValue,
    }
    applySetDefaultsHead(site, addData)
    // Assert title is added
    expect(site.defaults.head.title).toEqual(newValue)

    const updatedValue = 'UPDATED TITLE'
    const updateData: ISetDefaultsHeadData = {
      tag: 'title',
      index: 0,
      oldValue: newValue,
      newValue: updatedValue,
    }
    // Assert title is updated
    applySetDefaultsHead(site, updateData)
    expect(site.defaults.head.title).toEqual(updatedValue)

    const removeData: ISetDefaultsHeadData = {
      tag: 'title',
      index: 0,
      oldValue: updatedValue,
      newValue: undefined,
    }
    applySetDefaultsHead(site, removeData)
    // Assert title is removed
    expect(site.defaults.head.title).toBeUndefined()

    // Undo all
    undoSetDefaultsHead(site, removeData)
    expect(site.defaults.head.title).toEqual(updatedValue)
    undoSetDefaultsHead(site, updateData)
    expect(site.defaults.head.title).toEqual(newValue)
    undoSetDefaultsHead(site, addData)
    expect(site.defaults.head.title).toBeUndefined()
  })

  it('should add, set, and remove description', () => {
    const newValue = 'Some Description'
    const addData: ISetDefaultsHeadData = {
      tag: 'description',
      index: 0,
      newValue,
    }
    applySetDefaultsHead(site, addData)
    // Assert description is added
    expect(site.defaults.head.description).toEqual(newValue)

    const updatedValue = 'UPDATED DESCRIPTION'
    const updateData: ISetDefaultsHeadData = {
      tag: 'description',
      index: 0,
      oldValue: newValue,
      newValue: updatedValue,
    }
    // Assert description is updated
    applySetDefaultsHead(site, updateData)
    expect(site.defaults.head.description).toEqual(updatedValue)

    const removeData: ISetDefaultsHeadData = {
      tag: 'description',
      index: 0,
      oldValue: updatedValue,
      newValue: undefined,
    }
    applySetDefaultsHead(site, removeData)
    // Assert description is removed
    expect(site.defaults.head.description).toBeUndefined()

    // Undo all
    undoSetDefaultsHead(site, removeData)
    expect(site.defaults.head.description).toEqual(updatedValue)
    undoSetDefaultsHead(site, updateData)
    expect(site.defaults.head.description).toEqual(newValue)
    undoSetDefaultsHead(site, addData)
    expect(site.defaults.head.description).toBeUndefined()
  })

  describe('multiple items in head meta array', () => {
    let data1: ISetDefaultsHeadData
    let data2: ISetDefaultsHeadData
    let data3: ISetDefaultsHeadData

    beforeEach(() => {
      data1 = {
        tag: 'meta',
        index: 0,
        newValue: {
          property: 'og:title',
          content: 'PubStudio Example',
        },
      }
      applySetDefaultsHead(site, data1)
      data2 = {
        tag: 'meta',
        index: 1,
        newValue: {
          property: 'og:url',
          content: 'https://library-example.pubstud.io',
        },
      }
      applySetDefaultsHead(site, data2)
      data3 = {
        tag: 'meta',
        index: 2,
        newValue: {
          property: 'og:type',
          content: 'pubstudio-library-example:site',
        },
      }
      applySetDefaultsHead(site, data3)
      expect(site.defaults.head.meta?.length).toEqual(3)
    })

    it('removes multiple items in meta array', () => {
      const remove1: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 2,
        oldValue: data3.newValue,
      }
      // Remove last
      applySetDefaultsHead(site, remove1)
      expect(site.defaults.head.meta?.length).toEqual(2)
      expect(site.defaults.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data2.newValue)

      // Remove first
      const remove2: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 0,
        oldValue: data1.newValue,
      }
      applySetDefaultsHead(site, remove2)
      expect(site.defaults.head.meta?.length).toEqual(1)
      expect(site.defaults.head.meta?.[0]).toEqual(data2.newValue)

      // Remove remaining
      const remove3: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 0,
        oldValue: data2.newValue,
      }
      applySetDefaultsHead(site, remove3)
      expect(site.defaults.head.meta?.length).toBeUndefined()

      // Undo all
      undoSetDefaultsHead(site, remove3)
      expect(site.defaults.head.meta?.length).toEqual(1)
      expect(site.defaults.head.meta?.[0]).toEqual(data2.newValue)

      undoSetDefaultsHead(site, remove2)
      expect(site.defaults.head.meta?.length).toEqual(2)
      expect(site.defaults.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data2.newValue)

      undoSetDefaultsHead(site, remove1)
      expect(site.defaults.head.meta?.length).toEqual(3)
      expect(site.defaults.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data2.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(data3.newValue)
    })

    it('adds multiple items in meta array', () => {
      // Add to start
      const add1: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 0,
        newValue: {
          property: 'twitter:card',
          content: 'summary_large_image',
        },
      }
      applySetDefaultsHead(site, add1)
      expect(site.defaults.head.meta?.length).toEqual(4)
      expect(site.defaults.head.meta?.[0]).toEqual(add1.newValue)

      // Add to end
      const add2: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 4,
        newValue: {
          property: 'twitter:title',
          content: 'PubStudio Example',
        },
      }
      applySetDefaultsHead(site, add2)
      expect(site.defaults.head.meta?.length).toEqual(5)
      expect(site.defaults.head.meta?.[0]).toEqual(add1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(data2.newValue)
      expect(site.defaults.head.meta?.[3]).toEqual(data3.newValue)
      expect(site.defaults.head.meta?.[4]).toEqual(add2.newValue)

      // Add to middle
      const add3: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 2,
        newValue: {
          property: 'twitter:url',
          content: 'https://library-examplepubstud.io',
        },
      }
      applySetDefaultsHead(site, add3)
      expect(site.defaults.head.meta?.length).toEqual(6)
      expect(site.defaults.head.meta?.[0]).toEqual(add1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(add3.newValue)
      expect(site.defaults.head.meta?.[3]).toEqual(data2.newValue)
      expect(site.defaults.head.meta?.[4]).toEqual(data3.newValue)
      expect(site.defaults.head.meta?.[5]).toEqual(add2.newValue)

      // Undo all
      undoSetDefaultsHead(site, add3)
      expect(site.defaults.head.meta?.length).toEqual(5)
      expect(site.defaults.head.meta?.[0]).toEqual(add1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(data2.newValue)
      expect(site.defaults.head.meta?.[3]).toEqual(data3.newValue)
      expect(site.defaults.head.meta?.[4]).toEqual(add2.newValue)

      undoSetDefaultsHead(site, add2)
      expect(site.defaults.head.meta?.length).toEqual(4)
      expect(site.defaults.head.meta?.[0]).toEqual(add1.newValue)

      undoSetDefaultsHead(site, add1)
      expect(site.defaults.head.meta?.length).toEqual(3)
      expect(site.defaults.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data2.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(data3.newValue)
    })

    it('updates multiple items in meta array', () => {
      // Update first
      const update1: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 0,
        oldValue: data1.newValue,
        newValue: {
          href: 'newlink1',
          rel: 'icon',
        },
      }
      applySetDefaultsHead(site, update1)
      expect(site.defaults.head.meta?.length).toEqual(3)
      expect(site.defaults.head.meta?.[0]).toEqual(update1.newValue)

      // Update second
      const update2: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 1,
        oldValue: data2.newValue,
        newValue: {
          href: 'newlink2',
          rel: 'icon',
        },
      }
      applySetDefaultsHead(site, update2)
      expect(site.defaults.head.meta?.length).toEqual(3)
      expect(site.defaults.head.meta?.[1]).toEqual(update2.newValue)

      // Update second
      const update3: ISetDefaultsHeadData = {
        tag: 'meta',
        index: 2,
        oldValue: data3.newValue,
        newValue: {
          href: 'newlink3',
          rel: 'icon',
        },
      }
      applySetDefaultsHead(site, update3)
      expect(site.defaults.head.meta?.length).toEqual(3)
      expect(site.defaults.head.meta?.[2]).toEqual(update3.newValue)

      // Undo all
      undoSetDefaultsHead(site, update3)
      expect(site.defaults.head.meta?.[1]).toEqual(update2.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(data3.newValue)

      undoSetDefaultsHead(site, update2)
      expect(site.defaults.head.meta?.[0]).toEqual(update1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data2.newValue)

      undoSetDefaultsHead(site, update1)
      expect(site.defaults.head.meta?.[0]).toEqual(data1.newValue)
      expect(site.defaults.head.meta?.[1]).toEqual(data2.newValue)
      expect(site.defaults.head.meta?.[2]).toEqual(data3.newValue)
    })
  })
})
