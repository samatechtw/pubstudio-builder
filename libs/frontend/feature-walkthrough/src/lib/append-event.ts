import { appendLastCommand } from '@pubstudio/frontend/data-access-command'
import { addComponentEventData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import { IComponent, IComponentEvent, ISite } from '@pubstudio/shared/type-site'

export const appendEvent = (
  site: ISite,
  form: IComponent,
  event: IComponentEvent,
  save?: boolean,
) => {
  const addEvent = addComponentEventData(form, event)
  const command = {
    type: CommandType.SetComponentEvent,
    data: addEvent,
  }
  appendLastCommand(site, command, save)
}
