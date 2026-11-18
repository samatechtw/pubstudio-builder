export interface IComponentMixinData {
  componentId: string
  mixinId: string
}

export type IAddComponentMixinData = IComponentMixinData

export interface IRemoveComponentMixinData extends IComponentMixinData {
  mixinIndex?: number
}

export interface IReplaceComponentMixinData {
  componentId: string
  oldMixinId: string
  newMixinId: string
}
