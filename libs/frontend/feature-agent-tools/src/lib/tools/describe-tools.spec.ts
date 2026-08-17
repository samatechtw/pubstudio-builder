import { describeTools } from './describe-tools'

describe('describeTools', () => {
  it('returns the table of contents with no input', () => {
    const result = describeTools()
    expect(result.tools?.length).toBeGreaterThan(0)
    expect(result.ops?.length).toBeGreaterThan(0)
    expect(result.opDetails).toBeUndefined()
    expect(result.readInput).toBeUndefined()
  })

  it('omits the table of contents for a named op list', () => {
    const result = describeTools({ ops: ['setComponentStyle'] })
    expect(result.tools).toBeUndefined()
    expect(result.ops).toBeUndefined()
    expect(result.version).toEqual(describeTools().version)
    expect(result.opDetails?.map((op) => op.name)).toEqual(['setComponentStyle'])
  })

  it('keeps the table of contents on toc:true and includes every schema on all:true', () => {
    expect(describeTools({ ops: ['setComponentStyle'], toc: true }).ops).toBeDefined()
    expect(describeTools({ read: true, toc: true }).ops).toBeDefined()
    expect(describeTools({ all: true })).toMatchObject({
      ops: expect.any(Array),
      opDetails: expect.any(Array),
      readInput: expect.any(Object),
    })
    expect(describeTools({ all: true, toc: false }).ops).toBeUndefined()
  })

  it('returns the complete read selector schema without the table of contents', () => {
    const result = describeTools({ read: true })
    expect(result.tools).toBeUndefined()
    expect(result.ops).toBeUndefined()
    expect(result.opDetails).toBeUndefined()
    expect(result.readInput).toMatchObject({
      type: 'object',
      additionalProperties: false,
      properties: {
        site: { type: 'boolean' },
        tree: {
          type: 'object',
          additionalProperties: false,
          properties: {
            page: { type: 'string' },
            componentId: { type: 'string' },
            depth: { type: 'number', default: 4 },
          },
        },
        components: { type: 'array', items: { type: 'string' } },
        include: {
          type: 'array',
          items: { type: 'string', enum: expect.arrayContaining(['style', 'children']) },
        },
        styles: {
          type: 'object',
          required: ['componentId'],
          properties: {
            componentId: { type: 'string' },
            breakpointId: { type: 'string' },
            resolved: { type: 'boolean', default: false },
          },
        },
        find: {
          type: 'object',
          properties: {
            tag: { type: 'string' },
            name: { type: 'string' },
            text: { type: 'string' },
            hasMixin: { type: 'string' },
            page: { type: 'string' },
          },
        },
        mixins: { anyOf: expect.any(Array) },
        theme: { type: 'boolean' },
        behaviors: { anyOf: expect.any(Array) },
        i18n: { anyOf: expect.any(Array) },
        head: { type: 'object' },
        builtins: { type: 'boolean' },
        html: { type: 'object', required: ['componentId'] },
        history: { type: 'object' },
      },
    })
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
