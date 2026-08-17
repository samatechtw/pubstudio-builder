import {
  defaultsHeadValue,
  makeSetDefaultsHeadData,
  makeSetGlobalStyleData,
  makeSetTranslationsData,
} from '@pubstudio/frontend/util-command-data'
import { clone } from '@pubstudio/frontend/util-component'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddBreakpoint,
  INewTranslations,
  IReplaceTranslationsData,
  ISetBreakpointData,
  ISetDefaultsHeadData,
  ISetGlobalStyleData,
  ISetTranslationsData,
} from '@pubstudio/shared/type-command-data'
import { IHeadObject, IHeadTag, ITranslations } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import { constraint } from '../op/op-helpers'
import { arr, json, num, obj, oneOf, record, str } from '../schema/schema'

const SITE_HEAD_TAGS: IHeadTag[] = [
  'title',
  'description',
  'base',
  'meta',
  'link',
  'script',
]

export const setSiteHeadOp = defineOp<ISetDefaultsHeadData>()({
  name: 'setSiteHead',
  command: CommandType.SetDefaultsHead,
  title: 'Set site-wide head tag',
  description:
    'Add, replace or remove an entry in the site-wide <head> defaults, which every page ' +
    'inherits unless it sets its own. `title`, `description` and `base` are single ' +
    'entries at index 0; meta, link and script are lists — omit `index` to append. Omit ' +
    '`value` to remove.',
  input: obj({
    tag: oneOf(SITE_HEAD_TAGS).desc('Head tag to write.'),
    value: json()
      .optional()
      .desc(
        'String for `title`/`description`; an object for the others, e.g. ' +
          '{"rel":"icon","href":"…"}. Omit to remove.',
      ),
    index: num().optional().desc('Entry index. Appends when omitted.'),
  }),
  derived: ['oldValue', 'newValue'],
  omitted: {},
  resolve: (ctx, input) => {
    const single =
      input.tag === 'title' || input.tag === 'description' || input.tag === 'base'
    const index = single ? 0 : input.index
    if (input.value === undefined) {
      if (
        index === undefined ||
        defaultsHeadValue(ctx.site, input.tag, index) === undefined
      ) {
        constraint(`Site head has no ${input.tag} entry at index ${index ?? 0}.`)
      }
    }
    return {
      type: CommandType.SetDefaultsHead,
      data: makeSetDefaultsHeadData(
        ctx.site,
        input.tag,
        index,
        input.value as IHeadObject | undefined,
      ),
    }
  },
  example: () => ({ tag: 'title' as IHeadTag, value: 'Set by agent' }),
})

export const setGlobalStyleOp = defineOp<ISetGlobalStyleData>()({
  name: 'setGlobalStyle',
  command: CommandType.SetGlobalStyle,
  title: 'Set global CSS',
  description:
    'Create, rename, update or delete a named block of raw CSS emitted for the whole ' +
    'site. Use it for things the style system cannot express, such as keyframes or ' +
    'element selectors. Omit `css` to delete the block.',
  input: obj({
    name: str().desc('Global style name.'),
    css: str().optional().desc('Raw CSS. Omit to delete the block.'),
    newName: str().optional().desc('Rename the block to this name.'),
  }),
  derived: ['oldStyle', 'newStyle'],
  omitted: {},
  resolve: (ctx, input) => {
    const exists = ctx.site.context.globalStyles[input.name] !== undefined
    if (!exists && input.css === undefined) {
      constraint(`No global style "${input.name}" to remove.`)
    }
    if (!exists && input.newName) {
      constraint(`No global style "${input.name}" to rename.`)
    }
    return {
      type: CommandType.SetGlobalStyle,
      data: makeSetGlobalStyleData(
        ctx.site,
        input.name,
        input.newName,
        input.css === undefined ? undefined : { style: input.css },
      ),
    }
  },
  example: () => ({ name: 'agent-global', css: '.agent { outline: 1px solid red; }' }),
})

export const setBreakpointsOp = defineOp<ISetBreakpointData>()({
  name: 'setBreakpoints',
  command: CommandType.SetBreakpoint,
  title: 'Replace the breakpoint set',
  description:
    'Replace the site’s responsive breakpoints wholesale — pass every breakpoint you want ' +
    'to keep, including the default one. Entries without an `id` are created; keep the ' +
    'existing ids to preserve styles already written against them.',
  input: obj({
    breakpoints: arr(
      obj({
        id: str().optional().desc('Existing breakpoint id. Omit to create a new one.'),
        name: str().optional().desc('Display name.'),
        minWidth: num().optional().desc('Minimum viewport width in px.'),
        maxWidth: num().optional().desc('Maximum viewport width in px.'),
      }),
    ).desc('The complete breakpoint set after the change.'),
  }),
  derived: ['oldBreakpoints', 'newBreakpoints'],
  omitted: {},
  resolve: (ctx, input) => {
    for (const bp of input.breakpoints) {
      if (bp.id && !ctx.site.context.breakpoints[bp.id]) {
        constraint(`No breakpoint "${bp.id}". See read({site:true}).`)
      }
    }
    const data: ISetBreakpointData = {
      oldBreakpoints: clone(ctx.site.context.breakpoints),
      newBreakpoints: input.breakpoints as IAddBreakpoint[],
    }
    return { type: CommandType.SetBreakpoint, data }
  },
  example: (site) => ({
    breakpoints: Object.values(site.context.breakpoints).map((bp) => ({
      id: bp.id,
      name: bp.name,
      minWidth: bp.minWidth,
      maxWidth: bp.maxWidth === undefined ? undefined : bp.maxWidth - 1,
    })),
  }),
})

export const setTranslationsOp = defineOp<ISetTranslationsData>()({
  name: 'setTranslations',
  command: CommandType.SetTranslations,
  title: 'Set translations for a language',
  description:
    'Merge translation keys into one language. Pass null for a key to delete it. Keys are ' +
    'referenced from component content; see read({i18n:true}).',
  input: obj({
    code: str().desc('Language code, e.g. "en".'),
    translations: record(str().optional()).desc(
      'Keys to set. A null value removes the key.',
    ),
  }),
  derived: ['oldTranslations', 'newTranslations'],
  omitted: {},
  resolve: (ctx, input) => ({
    type: CommandType.SetTranslations,
    data: makeSetTranslationsData(
      ctx.site.context,
      input.code,
      input.translations as INewTranslations,
    ),
  }),
  example: () => ({ code: 'en', translations: { 'agent-key': 'Agent value' } }),
})

export const replaceTranslationsOp = defineOp<IReplaceTranslationsData>()({
  name: 'replaceTranslations',
  command: CommandType.ReplaceTranslations,
  title: 'Replace all translations',
  description:
    'Replace every language and key at once. Use setTranslations for incremental edits; ' +
    'this is for bulk import.',
  input: obj({
    translations: record(record(str())).desc(
      'Language code to translation map, replacing the whole i18n context.',
    ),
  }),
  derived: ['oldTranslations', 'newTranslations'],
  omitted: {},
  resolve: (ctx, input) => {
    const data: IReplaceTranslationsData = {
      oldTranslations: clone(ctx.site.context.i18n),
      newTranslations: input.translations as Record<string, ITranslations>,
    }
    return { type: CommandType.ReplaceTranslations, data }
  },
  example: (site) => ({
    translations: { ...clone(site.context.i18n), fr: { hello: 'Bonjour' } },
  }),
})
