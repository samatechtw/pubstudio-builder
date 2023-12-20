import { nextBehaviorId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISetBehaviorData } from '@pubstudio/shared/type-command-data'
import { IBehavior, ISite, ISiteContext } from '@pubstudio/shared/type-site'
import { applySetBehavior, undoSetBehavior } from './set-behavior'

describe('Set Component Input', () => {
  let siteString: string
  let site: ISite
  let context: ISiteContext
  let behavior: IBehavior

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    context = site.context
    behavior = { id: nextBehaviorId(site.context), name: 'text', code: '{}' }
  })

  it('should add behavior and undo', () => {
    // Assert no behaviors in site context
    expect(context.behaviors).toEqual({})

    // Add behavior
    const data: ISetBehaviorData = {
      newBehavior: behavior,
    }
    applySetBehavior(site, data)
    // Assert behavior is added
    expect(context.behaviors[behavior.id]).toEqual(behavior)

    undoSetBehavior(site, data)
    // Assert new behavior is removed
    expect(context.behaviors).toEqual({})
  })

  it('should remove behavior', () => {
    // Set up behavior
    const data: ISetBehaviorData = {
      newBehavior: behavior,
    }
    applySetBehavior(site, data)

    // Set behavior and undo
    const removeData: ISetBehaviorData = {
      oldBehavior: behavior,
    }
    applySetBehavior(site, removeData)
    // Assert behavior is removed
    expect(context.behaviors).toEqual({})

    undoSetBehavior(site, removeData)
    // Assert behavior added again
    expect(context.behaviors[behavior.id]).toEqual(behavior)
  })

  it('should edit behavior', () => {
    // Set up behavior
    const data: ISetBehaviorData = {
      newBehavior: behavior,
    }
    applySetBehavior(site, data)

    // Set behavior and undo
    const newBehavior = { id: behavior.id, name: 'newname', code: '1+1' }
    const removeData: ISetBehaviorData = {
      oldBehavior: behavior,
      newBehavior,
    }
    applySetBehavior(site, removeData)
    // Assert behavior is removed
    expect(context.behaviors[behavior.id]).toEqual(newBehavior)

    undoSetBehavior(site, removeData)
    // Assert behavior added again
    expect(context.behaviors[behavior.id]).toEqual(behavior)
  })
})
