import {
  enterComponentEdit,
  redoCommand,
  undoLastCommand,
} from '@pubstudio/frontend/data-access-command'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { h1 } from '@pubstudio/frontend/util-builtin'
import { stringifySite } from '@pubstudio/frontend/util-site-store'
import { addBuiltinComponent } from './add-builtin/add-builtin-component'
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

    addBuiltinComponent(build.site.value, { id: h1.id })

    expect(build.site.value.context.nextId).toEqual(2)

    // Site snapshot
    const siteStr = stringifySite(build.site.value)

    // Undo and redo
    undoLastCommand(build.site.value)
    expect(build.site.value.context.nextId).toEqual(1)
    redoCommand(build.site.value)

    expect(build.site.value.context.nextId).toEqual(2)
    expect(siteStr).toEqual(stringifySite(build.site.value))
  })

  it('does not paste a custom instance inside its definition', () => {
    const site = build.site.value
    const root = site.pages[site.defaults.homePage].root
    build.addComponent({ parentId: root.id, content: '' })
    const definition = build.getSelectedComponent()
    build.convertToCustomComponent(definition)
    const instance = build.getSelectedComponent()
    enterComponentEdit(site, definition.id)
    const depth = site.history.back.length

    build.pasteComponent(instance.id, definition)

    expect(definition.children).toBeUndefined()
    expect(site.history.back).toHaveLength(depth)
  })
})
