import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import { mockSerializedComponent } from '@pubstudio/frontend/util-test-mock'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import {
  EditorEventName,
  IBehavior,
  IComponentEditorEvents,
  ISite,
} from '@pubstudio/shared/type-site'
import { addComponentDataWithSelected } from './add-component-data-with-selected'

export interface IMockedComponentBehavior {
  componentData: IAddComponentData
  oldBehavior: IBehavior
  mock: jest.Mock
}

// Create a test component with mocked editor event behavior
export const setupMockBehavior = (
  site: ISite,
  editorEvents?: EditorEventName[],
): IMockedComponentBehavior => {
  const events = editorEvents ?? []
  // Mock builtin "noBehavior"
  const oldBehavior = resolveBehavior(site.context, noBehaviorId) as IBehavior
  const noBehaviorMock = jest.fn()
  site.context.behaviors[noBehaviorId] = {
    id: noBehaviorId,
    name: noBehaviorId,
    builtin: noBehaviorMock,
  }

  // Add component with OnPageChange editor event
  const componentEvents: IComponentEditorEvents = {}
  for (const event of events) {
    componentEvents[event] = {
      name: event,
      behaviors: [{ behaviorId: noBehaviorId }],
    }
  }
  const newCmp = mockSerializedComponent(site)
  const componentData = addComponentDataWithSelected(newCmp, site.editor)
  componentData.editorEvents = componentEvents

  return { oldBehavior, componentData, mock: noBehaviorMock }
}
