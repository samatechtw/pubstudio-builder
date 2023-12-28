import { resolveStyle } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISetMixinEntryData } from '@pubstudio/shared/type-command-data'
import { ISite, IStyle, IStyleEntry } from '@pubstudio/shared/type-site'
import { editingStyleId } from '../edit-styles-data'

export interface SetMixinEntry extends ICommand<ISetMixinEntryData> {
  type: CommandType.SetMixinEntry
}

const setMixinEntry = (
  mixin: IStyle | undefined,
  breakpointId: string,
  oldStyle: IStyleEntry | undefined,
  newStyle: IStyleEntry | undefined,
) => {
  if (!oldStyle && !newStyle) {
    throw new Error('oldStyle or newStyle must be defined')
  }
  if (mixin) {
    // Delete old style
    if (oldStyle) {
      delete mixin.breakpoints[breakpointId]?.[oldStyle.pseudoClass]?.[oldStyle.property]
    }
    // Add new style
    if (newStyle) {
      const pseudoClass = mixin.breakpoints[breakpointId]?.[newStyle.pseudoClass]
      if (pseudoClass) {
        pseudoClass[newStyle.property] = newStyle.value
      } else {
        if (!mixin.breakpoints[breakpointId]) {
          mixin.breakpoints[breakpointId] = {}
        }
        mixin.breakpoints[breakpointId][newStyle.pseudoClass] = {
          [newStyle.property]: newStyle.value,
        }
      }
    }
  }
}

export const applySetMixinEntry = (site: ISite, data: ISetMixinEntryData) => {
  const { mixinId, oldStyle, newStyle } = data
  const mixin = resolveStyle(site.context, mixinId)
  setMixinEntry(mixin, data.breakpointId, oldStyle, newStyle)
}

export const undoSetMixinEntry = (site: ISite, data: ISetMixinEntryData) => {
  const { mixinId, oldStyle, newStyle } = data
  const mixin = resolveStyle(site.context, mixinId)
  setMixinEntry(mixin, data.breakpointId, newStyle, oldStyle)
  editingStyleId.value = mixinId
}
