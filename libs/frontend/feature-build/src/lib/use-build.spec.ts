import { redoCommand, undoLastCommand } from '@pubstudio/frontend/feature-command'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { h1 } from '@pubstudio/frontend/util-builtin'
import { stringifySite } from '@pubstudio/frontend/util-site-store'
import { IUseBuild, useBuild } from './use-build'

describe('Use Build', () => {
  let build: IUseBuild

  beforeEach(async () => {
    build = useBuild()
    // Initialize scratch site
    await initializeSiteStore({ siteId: undefined })
  })

  it('add a builtin component, redo, and undo', () => {
    expect(build.site.value.context.nextId).toEqual(1)

    build.addBuiltinComponent(h1.id)

    expect(build.site.value.context.nextId).toEqual(2)

    // Site snapshot
    const siteStr = stringifySite(build.site.value)

    // Undo and redo
    undoLastCommand()
    expect(build.site.value.context.nextId).toEqual(1)
    redoCommand()

    expect(build.site.value.context.nextId).toEqual(2)
    expect(siteStr).toEqual(stringifySite(build.site.value))
  })
})
