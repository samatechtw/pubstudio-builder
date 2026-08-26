import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IInstanceOverride, ISerializedComponent } from '@pubstudio/shared/type-site'
import { IAddComponentData } from './i-add-component-data'
import { IRemoveComponentData } from './i-remove-component-data'

export interface IConvertToCustomComponentData {
  // Page component to turn into a definition
  componentId: string
  // Where the instance is inserted, and where the component returns on undo
  parentId: string
  parentIndex: number
  // Assigned during apply, like IAddComponentData.id
  instanceId?: string
  // Preserves editor scaffolding across undo/redo
  arena?: ISerializedComponent
}

export interface ConvertToCustomComponent extends ICommand<IConvertToCustomComponentData> {
  type: CommandType.ConvertToCustomComponent
}

export interface IRemoveCustomComponentData {
  componentId: string
  // Definition tree, for undo
  component: ISerializedComponent
  // Position in the definition registry, for undo
  index: number
  // Preserves editor scaffolding across undo/redo
  arena?: ISerializedComponent
}

export interface RemoveCustomComponent extends ICommand<IRemoveCustomComponentData> {
  type: CommandType.RemoveCustomComponent
}

export interface IDetachInstanceData {
  // Instance being replaced by an independent copy
  instance: IRemoveComponentData
  // Materialized copy, built from the definition and the instance's overrides
  replacement: IAddComponentData
}

export interface DetachInstance extends ICommand<IDetachInstanceData> {
  type: CommandType.DetachInstance
}

export interface ISetInstanceOverrideData {
  // Instance the override is stored on
  componentId: string
  // Definition descendant the override applies to
  childId: string
  oldOverride?: IInstanceOverride
  newOverride?: IInstanceOverride
}

export interface SetInstanceOverride extends ICommand<ISetInstanceOverrideData> {
  type: CommandType.SetInstanceOverride
}
