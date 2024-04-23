import { ISetGlobalStyleData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const applySetGlobalStyle = (site: ISite, data: ISetGlobalStyleData) => {
  const { name, newName, oldStyle, newStyle } = data

  // Remove
  if (oldStyle && !newStyle) {
    delete site.context.globalStyles[name]

    // Add
  } else if (newStyle && !oldStyle) {
    site.context.globalStyles[name] = newStyle

    // Set style with new name
  } else if (newName) {
    const originalStyle = site.context.globalStyles[name]
    delete site.context.globalStyles[name]
    site.context.globalStyles[newName] = newStyle ?? originalStyle

    // Set style
  } else if (newStyle) {
    site.context.globalStyles[name] = newStyle
  }
}

export const undoSetGlobalStyle = (site: ISite, data: ISetGlobalStyleData) => {
  const { name, newName, oldStyle, newStyle } = data

  // Undo add
  if (newStyle && !oldStyle) {
    delete site.context.globalStyles[name]

    // Undo remove
  } else if (oldStyle && !newStyle) {
    site.context.globalStyles[name] = oldStyle

    // Undo set style with new name
  } else if (newName) {
    const originalStyle = site.context.globalStyles[newName]
    delete site.context.globalStyles[newName]
    site.context.globalStyles[name] = oldStyle ?? originalStyle

    // Undo set style
  } else if (oldStyle) {
    site.context.globalStyles[name] = oldStyle
  }
}
