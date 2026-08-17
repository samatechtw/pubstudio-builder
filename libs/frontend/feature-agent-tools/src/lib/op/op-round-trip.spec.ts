import {
  applyCommand,
  pushAppliedGroup,
  undoLastCommand,
} from '@pubstudio/frontend/data-access-command'
import { ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { AnyOpDef } from './define-op'
import { agentOps } from './op-registry'
import {
  makeReactiveTestSite,
  makeTestSite,
  siteContentSnapshot,
  siteStateSnapshot,
  testOpCtx,
} from './test-site'

const toArray = (commands: ICommand | ICommand[]): ICommand[] =>
  Array.isArray(commands) ? commands : [commands]

const resolveExample = (op: AnyOpDef, site: ISite): ICommand[] => {
  const parsed = op.input.parse(op.example(site), '', [])
  return toArray(op.resolve(testOpCtx(site), parsed))
}

const roundTrip = (op: AnyOpDef, makeSite: () => ISite) => {
  const site = makeSite()
  const before = siteContentSnapshot(site)
  const beforeState = siteStateSnapshot(site)

  const commands = resolveExample(op, site)
  expect(commands.length).toBeGreaterThan(0)
  commands.forEach((command) => applyCommand(site, command))

  expect(siteStateSnapshot(site)).not.toEqual(beforeState)

  // Via the history stack, as apply()/history() do, a locally held group would hand the
  // undo half plain objects instead of whatever `history.back.pop()` returns.
  pushAppliedGroup(site, commands, op.name)
  undoLastCommand(site)
  expect(siteContentSnapshot(site)).toEqual(before)
}

// An op is the forward half of a command; the resolver derives the undo half from live
// state. That makes the existing undo machinery a correctness oracle for every op.
describe.each(agentOps().map((op) => [op.name, op] as const))('op %s', (_name, op) => {
  it('example input validates against its own schema', () => {
    const site = makeTestSite()
    const issues: { path: string; message: string }[] = []
    op.input.parse(op.example(site), '', issues)
    expect(issues).toEqual([])
  })

  it('every input field has a description', () => {
    const schema = op.input.toJson() as {
      properties?: Record<string, { description?: string }>
    }
    const missing = Object.entries(schema.properties ?? {})
      .filter(([, field]) => !field.description)
      .map(([key]) => key)
    expect(missing).toEqual([])
  })

  it('apply then undo restores the site exactly', () => {
    roundTrip(op, makeTestSite)
  })

  it('apply then undo restores a reactive site exactly', () => {
    roundTrip(op, makeReactiveTestSite)
  })
})

describe('op registry', () => {
  it('op names are unique', () => {
    const names = agentOps().map((op) => op.name)
    expect(new Set(names).size).toEqual(names.length)
  })

  it('op names are camelCase', () => {
    const bad = agentOps()
      .map((op) => op.name)
      .filter((name) => !/^[a-z][a-zA-Z]*$/.test(name))
    expect(bad).toEqual([])
  })

  it('every omitted field carries a reason', () => {
    const bad: string[] = []
    for (const op of agentOps()) {
      for (const [field, reason] of Object.entries(op.omitted)) {
        if (!reason) {
          bad.push(`${op.name}.${field}`)
        }
      }
    }
    expect(bad).toEqual([])
  })
})
