import { IStoredSite } from '@pubstudio/shared/type-site'
import { ICommandBatch, WireCommand } from '@pubstudio/shared/type-command'
// Shared with the Rust replay crate; deliberately lives outside any Nx project.
// eslint-disable-next-line @nx/enforce-module-boundaries
import replayFixtures from '../../../../../fixtures/collaboration/replay.json'
import { applyWireCommands, diffStoredSites } from './collaboration'

const stored = (overrides: Partial<IStoredSite> = {}): IStoredSite => ({
  name: 'Site',
  version: '3',
  context: JSON.stringify({ theme: { primary: 'red' } }),
  defaults: JSON.stringify({ homePage: '/' }),
  pages: JSON.stringify({
    '/': {
      root: {
        id: 'root',
        children: [
          { id: 'a', content: 'A' },
          { id: 'b', content: 'B' },
        ],
      },
    },
  }),
  pageOrder: JSON.stringify(['/']),
  editor: JSON.stringify({ selectedComponentId: 'a' }),
  history: JSON.stringify({ back: [], forward: [] }),
  revision: 0,
  ...overrides,
})

describe('collaboration wire commands', () => {
  it('replays the language-neutral fixture corpus', () => {
    for (const fixture of replayFixtures) {
      const initial = stored({
        name: fixture.initial.name,
        version: fixture.initial.version,
        context: JSON.stringify(fixture.initial.context),
        defaults: JSON.stringify(fixture.initial.defaults),
        pages: JSON.stringify(fixture.initial.pages),
        pageOrder: JSON.stringify(fixture.initial.page_order),
      })
      if (fixture.conflict) {
        expect(() =>
          applyWireCommands(
            initial,
            (fixture.batch as ICommandBatch).commands as WireCommand[],
          ),
        ).toThrow()
      } else {
        const result = applyWireCommands(
          initial,
          (fixture.batch as ICommandBatch).commands as WireCommand[],
        )
        expect({
          name: result.name,
          version: result.version,
          context: JSON.parse(result.context as string),
          defaults: JSON.parse(result.defaults as string),
          pages: JSON.parse(result.pages as string),
          page_order: JSON.parse(result.pageOrder as string),
        }).toEqual(fixture.expected)
      }
    }
  })

  it('merges stale non-overlapping edits', () => {
    const base = stored()
    const rename = diffStoredSites(base, stored({ name: 'Renamed' }))
    const recolor = diffStoredSites(
      base,
      stored({ context: JSON.stringify({ theme: { primary: 'blue' } }) }),
    )

    const merged = applyWireCommands(applyWireCommands(base, rename), recolor)
    expect(merged.name).toEqual('Renamed')
    expect(JSON.parse(merged.context as string).theme.primary).toEqual('blue')
  })

  it('targets nested components by ID after a concurrent insertion', () => {
    const base = stored()
    const pages = JSON.parse(base.pages as string)
    pages['/'].root.children[1].content = 'Updated B'
    const editB = diffStoredSites(base, stored({ pages: JSON.stringify(pages) }))
    expect(editB[0].path).toContainEqual({ id: 'b' })

    const insertedPages = JSON.parse(base.pages as string)
    insertedPages['/'].root.children.unshift({ id: 'new', content: 'New' })
    const withInsertion = applyWireCommands(
      base,
      diffStoredSites(base, stored({ pages: JSON.stringify(insertedPages) })),
    )
    const merged = applyWireCommands(withInsertion, editB)
    expect(JSON.parse(merged.pages as string)['/'].root.children[2].content).toEqual(
      'Updated B',
    )
  })

  it('uses stable anchors for additions and moves', () => {
    const base = stored()
    const pages = JSON.parse(base.pages as string)
    pages['/'].root.children = [
      { id: 'b', content: 'B' },
      { id: 'c', content: 'C' },
      { id: 'a', content: 'A' },
    ]
    const commands = diffStoredSites(base, stored({ pages: JSON.stringify(pages) }))
    expect(commands[0].type).toEqual('insert')
    expect(commands.slice(1).every((command) => command.type === 'move')).toEqual(true)
    expect(applyWireCommands(base, commands).pages).toEqual(JSON.stringify(pages))
  })

  it('treats accepted inserts as idempotent after Rust reorders object keys', () => {
    const base = stored()
    const pages = JSON.parse(base.pages as string)
    pages['/'].root.children.push({ content: 'New', id: 'new' })
    const canonical = stored({ pages: JSON.stringify(pages) })
    const command: WireCommand = {
      type: 'insert',
      section: 'pages',
      path: ['/', 'root', 'children'],
      item_id: 'new',
      item: { id: 'new', content: 'New' },
      after_id: 'b',
      before_id: null,
    }

    expect(applyWireCommands(canonical, [command])).toEqual(canonical)
  })

  it('rejects same-value precondition conflicts without mutating its input', () => {
    const base = stored()
    const local = diffStoredSites(base, stored({ name: 'Local' }))
    const remote = applyWireCommands(
      base,
      diffStoredSites(base, stored({ name: 'Remote' })),
    )

    expect(() => applyWireCommands(remote, local)).toThrow('precondition')
    expect(remote.name).toEqual('Remote')
  })

  it('does not include per-tab editor or history state', () => {
    const base = stored()
    const changed = stored({ editor: '{}', history: '{"back":[1],"forward":[]}' })
    expect(diffStoredSites(base, changed)).toEqual([])
  })
})
