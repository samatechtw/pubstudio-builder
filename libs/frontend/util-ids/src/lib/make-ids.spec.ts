import { ISiteContext } from '@pubstudio/shared/type-site'
import {
  latestComponentId,
  nextBehaviorId,
  nextBreakpointId,
  nextComponentId,
  nextStyleId,
  peekNextId,
  setCollaborationClientId,
} from './make-ids'

const context = (nextId = 7): ISiteContext =>
  ({ namespace: 'site', nextId }) as ISiteContext

afterEach(() => setCollaborationClientId(undefined))

describe('collaborative IDs', () => {
  it('namespaces every persistent generated ID with the stable tab client ID', () => {
    const site = context()
    setCollaborationClientId('client-a')

    expect(peekNextId(site)).toEqual('7_client-a')
    expect(peekNextId(site, 2)).toEqual('9_client-a')
    expect(nextComponentId(site)).toEqual('site-c-7_client-a')
    expect(latestComponentId(site)).toEqual('site-c-7_client-a')
    expect(nextStyleId(site)).toEqual('site-s-8_client-a')
    expect(nextBehaviorId(site)).toEqual('site-b-9_client-a')
    expect(nextBreakpointId(site)).toEqual('site-bp-10_client-a')
    expect(site.nextId).toEqual(11)
  })

  it('cannot collide when two tabs allocate from the same legacy counter', () => {
    setCollaborationClientId('client-a')
    const fromA = nextComponentId(context())
    setCollaborationClientId('client-b')
    const fromB = nextComponentId(context())

    expect(fromA).not.toEqual(fromB)
  })

  it('preserves the legacy ID format outside collaborative API stores', () => {
    setCollaborationClientId(undefined)
    expect(nextComponentId(context())).toEqual('site-c-7')
  })
})
