import { ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { optimizeCommandGroup } from './optimize-command-group'

// Applies a command and replaces the last command on the command stack
export const replaceLastCommand = (site: ISite, command: ICommand, save?: boolean) => {
  const cmd = optimizeCommandGroup(command)
  if (cmd) {
    const history = site.history
    applyCommand(site, command)
    history.back[history.back.length - 1] = command
    if (save) {
      site.editor?.store?.save(site)
    }
  }
}
