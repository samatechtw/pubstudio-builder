import { describeTools } from './describe-tools'

describe('describeTools', () => {
  it('returns the table of contents with no input', () => {
    const result = describeTools()
    expect(result.tools?.length).toBeGreaterThan(0)
    expect(result.ops?.length).toBeGreaterThan(0)
    expect(result.opDetails).toBeUndefined()
  })

  it('omits the table of contents for a named op list', () => {
    const result = describeTools({ ops: ['setComponentStyle'] })
    expect(result.tools).toBeUndefined()
    expect(result.ops).toBeUndefined()
    expect(result.version).toEqual(describeTools().version)
    expect(result.opDetails?.map((op) => op.name)).toEqual(['setComponentStyle'])
  })

  it('keeps the table of contents on toc:true and on all:true', () => {
    expect(describeTools({ ops: ['setComponentStyle'], toc: true }).ops).toBeDefined()
    expect(describeTools({ all: true }).ops).toBeDefined()
    expect(describeTools({ all: true, toc: false }).ops).toBeUndefined()
  })

  it('emits referenced long enums once under $defs', () => {
    const result = describeTools({ ops: ['setComponentStyle', 'setMixinStyle'] })
    expect(result.$defs?.cssProperty).toEqual({
      type: 'string',
      enum: expect.arrayContaining(['padding', 'color']),
    })
    const inputs = JSON.stringify(result.opDetails)
    expect(inputs).toContain('#/$defs/cssProperty')
    expect(inputs).not.toContain('padding')
  })

  it('emits only the defs the requested ops reference', () => {
    const result = describeTools({ ops: ['addPage'] })
    expect(result.$defs).toBeUndefined()
  })
})
