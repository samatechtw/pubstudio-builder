import { IStyle } from '@pubstudio/shared/type-site'

// Use the whole style instead of just id because
// we need to be able to recreate the style for undo
export interface IRemoveStyleMixinData extends IStyle {}
