import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddThemeFontData,
  IAddThemeVariableData,
  IEditThemeFontData,
  IEditThemeVariableData,
  IRemoveThemeFontData,
  IRemoveThemeVariableData,
} from '@pubstudio/shared/type-command-data'
import { ThemeFontSource, WebSafeFont } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import { constraint } from '../op/op-helpers'
import { FONT_SOURCES } from '../schema/fields'
import { obj, oneOf, str } from '../schema/schema'

const WEB_SAFE_FONTS = Object.values(WebSafeFont)

const isColorValue = (value: string): boolean => /^(#|rgb|hsl)/i.test(value.trim())

const themeVariable = (key: string, value: string) => ({
  key,
  value,
  isColor: isColorValue(value),
})

const mustResolveVariable = (variables: Record<string, string>, key: string): string => {
  const value = variables[key]
  if (value === undefined) {
    constraint(`No theme variable "${key}". See read({theme:true}).`)
  }
  return value
}

export const addThemeVariableOp = defineOp<IAddThemeVariableData>()({
  name: 'addThemeVariable',
  command: CommandType.AddThemeVariable,
  title: 'Add theme variable',
  description:
    'Create a named theme value. Reference it from any style value as ${name}, e.g. ' +
    'setComponentStyle({property:"color", value:"${color-primary}"}).',
  input: obj({
    key: str().desc('Variable name, without the ${} wrapper.'),
    value: str().desc('Variable value, e.g. "#95b1d1" or "16px".'),
  }),
  derived: [],
  omitted: {},
  resolve: (ctx, input) => {
    if (ctx.site.context.theme.variables[input.key] !== undefined) {
      constraint(`Theme variable "${input.key}" already exists; use editThemeVariable.`)
    }
    return {
      type: CommandType.AddThemeVariable,
      data: { key: input.key, value: input.value },
    }
  },
  example: () => ({ key: 'color-agent', value: '#334455' }),
})

export const editThemeVariableOp = defineOp<IEditThemeVariableData>()({
  name: 'editThemeVariable',
  command: CommandType.EditThemeVariable,
  title: 'Edit theme variable',
  description:
    'Change a theme variable’s value, its name, or both. Renaming does not rewrite ' +
    'existing ${old-name} references — update those yourself.',
  input: obj({
    key: str().desc('Existing variable name.'),
    newKey: str().optional().desc('Rename the variable to this name.'),
    value: str().optional().desc('New value. Keeps the current value when omitted.'),
  }),
  derived: ['oldThemeVariable', 'newThemeVariable'],
  omitted: {},
  resolve: (ctx, input) => {
    const variables = ctx.site.context.theme.variables
    const value = mustResolveVariable(variables, input.key)
    const data: IEditThemeVariableData = {
      oldThemeVariable: themeVariable(input.key, value),
      newThemeVariable: themeVariable(input.newKey ?? input.key, input.value ?? value),
    }
    return { type: CommandType.EditThemeVariable, data }
  },
  example: (site) => ({
    key: Object.keys(site.context.theme.variables)[0],
    value: '#654321',
  }),
})

export const removeThemeVariableOp = defineOp<IRemoveThemeVariableData>()({
  name: 'removeThemeVariable',
  command: CommandType.RemoveThemeVariable,
  title: 'Remove theme variable',
  description:
    'Delete a theme variable. Styles still referencing ${name} will resolve to nothing, ' +
    'so replace those first.',
  input: obj({ key: str().desc('Variable name to remove.') }),
  derived: ['value'],
  omitted: {},
  resolve: (ctx, input) => {
    const value = mustResolveVariable(ctx.site.context.theme.variables, input.key)
    return { type: CommandType.RemoveThemeVariable, data: { key: input.key, value } }
  },
  example: (site) => ({ key: Object.keys(site.context.theme.variables)[0] }),
})

export const addThemeFontOp = defineOp<IAddThemeFontData>()({
  name: 'addThemeFont',
  command: CommandType.AddThemeFont,
  title: 'Add theme font',
  description:
    'Register a font for the site. Use source "google" with the font family name, ' +
    '"native" for a web-safe font, or "custom" with a `url` to a hosted font file. Apply ' +
    'it with setComponentStyle({property:"font-family"}).',
  input: obj({
    name: str().desc('Font family name, e.g. "Roboto".'),
    source: oneOf(FONT_SOURCES).desc('Where the font comes from.'),
    url: str().optional().desc('Font file URL. Required for source "custom".'),
    fallback: oneOf(WEB_SAFE_FONTS).optional().desc('Web-safe fallback family.'),
  }),
  derived: [],
  omitted: {},
  resolve: (ctx, input) => {
    if (ctx.site.context.theme.fonts[input.name]) {
      constraint(`Theme font "${input.name}" already exists; use editThemeFont.`)
    }
    if (input.source === ThemeFontSource.Custom && !input.url) {
      constraint('A custom font needs a `url`.')
    }
    return {
      type: CommandType.AddThemeFont,
      data: {
        name: input.name,
        source: input.source,
        url: input.url,
        fallback: input.fallback,
      },
    }
  },
  example: () => ({ name: 'Roboto', source: ThemeFontSource.Google }),
})

export const editThemeFontOp = defineOp<IEditThemeFontData>()({
  name: 'editThemeFont',
  command: CommandType.EditThemeFont,
  title: 'Edit theme font',
  description:
    'Change a registered font’s family name, source, url or fallback. Fields you omit ' +
    'keep their current value.',
  input: obj({
    name: str().desc('Existing font family name.'),
    newName: str().optional().desc('Rename the font family.'),
    source: oneOf(FONT_SOURCES).optional().desc('New source.'),
    url: str().optional().desc('New font file URL.'),
    fallback: oneOf(WEB_SAFE_FONTS).optional().desc('New web-safe fallback family.'),
  }),
  derived: ['oldFont', 'newFont'],
  omitted: {},
  resolve: (ctx, input) => {
    const oldFont = ctx.site.context.theme.fonts[input.name]
    if (!oldFont) {
      constraint(`No theme font "${input.name}". See read({theme:true}).`)
    }
    const data: IEditThemeFontData = {
      oldFont: { ...oldFont },
      newFont: {
        name: input.newName ?? oldFont.name,
        source: input.source ?? oldFont.source,
        url: input.url ?? oldFont.url,
        fallback: input.fallback ?? oldFont.fallback,
      },
    }
    return { type: CommandType.EditThemeFont, data }
  },
  example: (site) => ({
    name: Object.keys(site.context.theme.fonts)[0],
    fallback: WebSafeFont.Arial,
  }),
})

export const removeThemeFontOp = defineOp<IRemoveThemeFontData>()({
  name: 'removeThemeFont',
  command: CommandType.RemoveThemeFont,
  title: 'Remove theme font',
  description:
    'Unregister a font. Styles that name the family still reference it, so update those ' +
    'first.',
  input: obj({ name: str().desc('Font family name to remove.') }),
  derived: ['source', 'url', 'fallback'],
  omitted: {},
  resolve: (ctx, input) => {
    const font = ctx.site.context.theme.fonts[input.name]
    if (!font) {
      constraint(`No theme font "${input.name}". See read({theme:true}).`)
    }
    return { type: CommandType.RemoveThemeFont, data: { ...font } }
  },
  example: (site) => ({ name: Object.keys(site.context.theme.fonts)[0] }),
})
