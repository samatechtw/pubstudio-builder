import { applyCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { ISite, Tag } from '@pubstudio/shared/type-site'
import { exampleComponentId, examplePageRoute } from '../op/op-helpers'
import { makeTestSite, testOpCtx } from '../op/test-site'
import { parseSchema } from '../schema/schema'
import { addComponentOp } from './component'

describe('addComponent source validation', () => {
  let site: ISite
  let parentId: string

  const add = (input: Record<string, unknown>): ICommand<IAddComponentData> => {
    const parsed = parseSchema(addComponentOp.input, { parentId, ...input })
    if (!parsed.ok) {
      throw new Error(JSON.stringify(parsed.issues))
    }
    return addComponentOp.resolve(
      testOpCtx(site),
      parsed.value,
    ) as ICommand<IAddComponentData>
  }

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

  it('requires tag when neither source field is provided', () => {
    expect(() => add({})).toThrow(/tag.*required/)
    expect(() => add({ tag: Tag.Div })).not.toThrow()
  })

  it('derives tag from sourceId when tag is omitted or conflicts', () => {
    const sourceId = exampleComponentId(site)
    site.context.components[sourceId].tag = Tag.Span

    expect(add({ sourceId }).data.tag).toBe(Tag.Span)
    expect(add({ sourceId, tag: Tag.Div }).data.tag).toBe(Tag.Span)
  })

  it('derives tag from customComponentId when tag is omitted', () => {
    const componentId = exampleComponentId(site)
    site.context.components[componentId].tag = Tag.Button
    applyCommand(site, {
      type: CommandType.AddCustomComponent,
      data: { componentId },
    })

    expect(add({ customComponentId: componentId }).data.tag).toBe(Tag.Button)
  })

  it('does not advertise tag as unconditionally required', () => {
    const required = addComponentOp.input.toJson().required as string[]
    expect(required).toEqual(['parentId'])
  })
})
