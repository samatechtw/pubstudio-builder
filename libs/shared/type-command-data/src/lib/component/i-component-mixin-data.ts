export interface IComponentMixinData {
  componentId: string
  mixinId: string
}

export type IAddComponentMixinData = IComponentMixinData

export type IRemoveComponentMixinData = IComponentMixinData

export interface IReplaceComponentMixinData {
  componentId: string
  oldMixinId: string
  newMixinId: string
}
