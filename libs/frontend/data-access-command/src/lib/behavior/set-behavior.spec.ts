import { latestBehaviorId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { INewBehavior, ISetBehaviorData } from '@pubstudio/shared/type-command-data'
import { IBehavior, ISite, ISiteContext } from '@pubstudio/shared/type-site'
import { applySetBehavior, undoSetBehavior } from './set-behavior'

describe('Set Component Input', () => {
  let siteString: string
  let site: ISite
  let context: ISiteContext
  let behavior: INewBehavior

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    context = site.context
    behavior = { id: undefined, name: 'text', code: '{}' }
  })

  const verifyNewBehavior = (behavior: IBehavior, newB: INewBehavior) => {
    expect(behavior.name).toEqual(newB.name)
    expect(behavior.code).toEqual(newB.code)
  }

  it('should add behavior and undo', () => {
    // Assert no behaviors in site context
    expect(context.behaviors).toEqual({})

    // Add behavior
    const data: ISetBehaviorData = {
      newBehavior: behavior,
    }
    applySetBehavior(site, data)
    // Assert behavior is added
    const id = latestBehaviorId(context)
    verifyNewBehavior(context.behaviors[id], behavior)

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

    // Remove behavior and undo
    const id = latestBehaviorId(context)
    const removeData: ISetBehaviorData = {
      oldBehavior: { id, ...behavior },
    }
    applySetBehavior(site, removeData)
    // Assert behavior is removed
    expect(context.behaviors).toEqual({})

    undoSetBehavior(site, removeData)
    // Assert behavior added again
    verifyNewBehavior(context.behaviors[id], behavior)
  })

  it('should edit behavior', () => {
    // Set up behavior
    const data: ISetBehaviorData = {
      newBehavior: behavior,
    }
    applySetBehavior(site, data)

    // Set behavior and undo
    const id = latestBehaviorId(context)
    const newBehavior = { id, name: 'newname', code: '1+1' }
    const removeData: ISetBehaviorData = {
      oldBehavior: { id, ...behavior },
      newBehavior,
    }
    applySetBehavior(site, removeData)
    // Assert behavior is updated
    expect(context.behaviors[id]).toEqual(newBehavior)

    undoSetBehavior(site, removeData)
    // Assert behavior set back to initial values
    verifyNewBehavior(context.behaviors[id], behavior)
  })
})
