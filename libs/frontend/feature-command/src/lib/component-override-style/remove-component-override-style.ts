import { setSelectedComponent } from '@pubstudio/frontend/util-build'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IRemoveComponentOverrideStyleData } from '@pubstudio/shared/type-command-data'
import { IBreakpointStyles, IComponent, ISite } from '@pubstudio/shared/type-site'

export interface RemoveComponentOverrideStyle
  extends ICommand<IRemoveComponentOverrideStyleData> {
  type: CommandType.RemoveComponentOverrideStyle
}

const removeOverrideStyle = (component: IComponent | undefined, selector: string) => {
  if (component) {
    const overrides = component.style.overrides ?? {}
    if (!(selector in overrides)) {
      throw new Error(
        `Selector ${selector} not in override styles of component ${component.id}`,
      )
    }
    delete overrides[selector]
  }
}

const addBackOverrideStyle = (
  component: IComponent | undefined,
  selector: string,
  styles: IBreakpointStyles,
) => {
  if (component) {
    if (!component.style.overrides) {
      component.style.overrides = {}
    }
    component.style.overrides[selector] = styles
  }
}

export const applyRemoveComponentOverrideStyle = (
  site: ISite,
  data: IRemoveComponentOverrideStyleData,
) => {
  const { componentId, selector } = data
  const component = resolveComponent(site.context, componentId)
  removeOverrideStyle(component, selector)
  // Select edited component for redo
  setSelectedComponent(site, component)
}

export const undoRemoveComponentOverrideStyle = (
  site: ISite,
  data: IRemoveComponentOverrideStyleData,
) => {
  const { componentId, selector, styles } = data
  const component = resolveComponent(site.context, componentId)
  addBackOverrideStyle(component, selector, styles)
  // Select edited component for undo
  setSelectedComponent(site, component)
}
