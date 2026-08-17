import { applyCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite, Tag } from '@pubstudio/shared/type-site'
import { exampleComponentId, examplePageRoute } from '../op/op-helpers'
import { makeTestSite, testOpCtx } from '../op/test-site'
import { addComponentOp } from './component'

describe('addComponent source validation', () => {
  let site: ISite
  let parentId: string

  const add = (input: Record<string, unknown>) =>
    addComponentOp.resolve(
      testOpCtx(site),
      addComponentOp.input.parse({ parentId, tag: Tag.Div, ...input }, '', []),
    )

  beforeEach(() => {
    site = makeTestSite()
    parentId = site.pages[examplePageRoute(site)].root.id
  })

  it('rejects a builtin sourceId, naming it as the problem', () => {
    expect(() => add({ sourceId: 'global-c-mailinglist' })).toThrow(/is a builtin/)
  })

  it('rejects an unknown sourceId', () => {
    expect(() => add({ sourceId: 'test-c-999' })).toThrow(/No component "test-c-999"/)
  })

  it('rejects a customComponentId that was never registered', () => {
    expect(() => add({ customComponentId: exampleComponentId(site) })).toThrow(
      /is not a custom component/,
    )
  })

  it('accepts a sourceId that exists in the site', () => {
    expect(() => add({ sourceId: exampleComponentId(site) })).not.toThrow()
  })

  it('accepts a registered customComponentId', () => {
    const componentId = exampleComponentId(site)
    const register: ICommand = {
      type: CommandType.AddCustomComponent,
      data: { componentId },
    }
    applyCommand(site, register)
    expect(() => add({ customComponentId: componentId })).not.toThrow()
  })
})
