import { resolveBehavior } from '@pubstudio/frontend/util-builtin'
import { nextBehaviorId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import {
  ISetBehaviorArgData,
  ISetBehaviorData,
} from '@pubstudio/shared/type-command-data'
import {
  ComponentArgPrimitive,
  IBehavior,
  IBehaviorArg,
  ISite,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { applySetBehavior } from './set-behavior'
import { applySetBehaviorArg, undoSetBehaviorArg } from './set-behavior-arg'

describe('Set Behavior Arg', () => {
  let siteString: string
  let site: ISite
  let context: ISiteContext
  let behavior: IBehavior
  let arg: IBehaviorArg

  const assertArg = (behaviorId: string, arg: IBehaviorArg | undefined) => {
    const behavior = resolveBehavior(context, behaviorId)
    if (arg) {
      expect(behavior?.args).toEqual({ [arg.name]: arg })
    } else {
      expect(behavior?.args).toBe(undefined)
    }
  }

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    context = site.context
    arg = {
      name: 'Text',
      type: ComponentArgPrimitive.String,
      default: 'TEST',
      help: 'some text',
    }

    // Add a behavior
    const data: ISetBehaviorData = {
      newBehavior: { id: nextBehaviorId(site.context), name: 'text', code: '{}' },
    }
    applySetBehavior(site, data)
    behavior = resolveBehavior(site.context, data.newBehavior!.id) as IBehavior
  })

  it('should add behavior arg and undo', () => {
    // Assert no args in behavior
    const behavior1 = resolveBehavior(context, behavior.id)
    expect(behavior1?.args).toBe(undefined)

    // Set behavior arg
    const data: ISetBehaviorArgData = {
      behaviorId: behavior.id,
      newArg: arg,
    }
    applySetBehaviorArg(site, data)
    // Assert arg is added
    assertArg(behavior.id, arg)

    undoSetBehaviorArg(site, data)
    // Assert new arg is removed
    assertArg(behavior.id, undefined)
  })

  it('should remove behavior arg', () => {
    // Set behavior arg
    const data1: ISetBehaviorArgData = {
      behaviorId: behavior.id,
      newArg: arg,
    }
    applySetBehaviorArg(site, data1)
    assertArg(behavior.id, arg)

    // Remove behavior arg
    const data2: ISetBehaviorArgData = {
      behaviorId: behavior.id,
      oldArg: arg,
    }
    applySetBehaviorArg(site, data2)
    assertArg(behavior.id, undefined)

    undoSetBehaviorArg(site, data2)
    // Assert arg added again
    assertArg(behavior.id, arg)
  })

  it('should update behavior arg', () => {
    // Set behavior arg
    const data1: ISetBehaviorArgData = {
      behaviorId: behavior.id,
      newArg: arg,
    }
    applySetBehaviorArg(site, data1)
    assertArg(behavior.id, arg)

    // Update behavior arg
    const newArg: IBehaviorArg = {
      name: 'Text2',
      type: ComponentArgPrimitive.Number,
      default: '1',
      help: 'other text',
    }
    const data2: ISetBehaviorArgData = {
      behaviorId: behavior.id,
      oldArg: arg,
      newArg,
    }
    applySetBehaviorArg(site, data2)

    // Assert arg is updated
    assertArg(behavior.id, newArg)

    undoSetBehaviorArg(site, data2)
    // Assert arg is reverted
    assertArg(behavior.id, arg)
  })
})
