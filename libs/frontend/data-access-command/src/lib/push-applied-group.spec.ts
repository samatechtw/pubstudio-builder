import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { Css, CssPseudoClass, ISite, Tag } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { pushAppliedGroup, undoLastCommand } from './command'

const setStyle = (value: string): ICommand => ({
  type: CommandType.SetComponentCustomStyle,
  data: {
    componentId: 'test-c-1',
    breakpointId: 'breakpoint-1',
    newStyle: {
      pseudoClass: CssPseudoClass.Default,
      property: Css.BackgroundColor,
      value,
    },
  },
})

describe('Push Applied Group', () => {
  let site: ISite

  beforeEach(() => {
    site = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite
    site.history.back = []
    site.history.forward = []
  })

  it('records already-applied commands as one undo step', () => {
    const commands = [setStyle('#ff0000'), setStyle('#00ff00')]
    commands.forEach((command) => applyCommand(site, command))

    expect(pushAppliedGroup(site, commands, 'agent batch')).toEqual(true)
    expect(site.history.back).toHaveLength(1)
    expect(
      site.context.components['test-c-1'].style.custom['breakpoint-1'].default,
    ).toEqual(expect.objectContaining({ [Css.BackgroundColor]: '#00ff00' }))

    undoLastCommand(site)
    expect(site.history.back).toHaveLength(0)
    expect(
      site.context.components['test-c-1'].style.custom['breakpoint-1'].default?.[
        Css.BackgroundColor
      ],
    ).toBeUndefined()
  })

  it('keeps a single command wrapped so the label survives', () => {
    const commands = [setStyle('#ff0000')]
    commands.forEach((command) => applyCommand(site, command))
    pushAppliedGroup(site, commands, 'one op')

    const entry = site.history.back[0]
    expect(entry.type).toEqual(CommandType.Group)
    expect((entry.data as ICommandGroupData).label).toEqual('one op')
  })

  it('does not apply the commands again', () => {
    const add: ICommand = {
      type: CommandType.AddComponent,
      data: { tag: Tag.Div, parentId: 'test-c-0' },
    }
    applyCommand(site, add)
    const componentCount = Object.keys(site.context.components).length

    pushAppliedGroup(site, [add])
    expect(Object.keys(site.context.components)).toHaveLength(componentCount)
  })

  it('clears the redo stack', () => {
    site.history.forward = [setStyle('#0000ff')]
    const commands = [setStyle('#ff0000')]
    commands.forEach((command) => applyCommand(site, command))

    pushAppliedGroup(site, commands)
    expect(site.history.forward).toHaveLength(0)
  })
})
