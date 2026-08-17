import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  ComponentArgPrimitive,
  Css,
  CssPseudoClass,
  Tag,
  ThemeFontSource,
} from '@pubstudio/shared/type-site'
import { oneOf, Schema, str } from './schema'

export const CSS_PROPERTIES = Object.values(Css).filter((p) => p !== Css.Empty)
export const PSEUDO_CLASSES = Object.values(CssPseudoClass)
export const TAGS = Object.values(Tag)
export const ARG_TYPES = Object.values(ComponentArgPrimitive)
export const FONT_SOURCES = Object.values(ThemeFontSource)

export const componentIdField = (): Schema<string> =>
  str().desc('Component id, e.g. "my-site-c-12". Find ids with read({tree:{}}).')

export const breakpointIdField = (): Schema<string | undefined> =>
  str()
    .dflt(DEFAULT_BREAKPOINT_ID)
    .desc(
      `Breakpoint id. Defaults to "${DEFAULT_BREAKPOINT_ID}" (the desktop base that all ` +
        'smaller breakpoints inherit from). See read({site:true}) for the site breakpoints.',
    )

export const pseudoClassField = (): Schema<CssPseudoClass | undefined> =>
  oneOf(PSEUDO_CLASSES).dflt(CssPseudoClass.Default).desc('CSS pseudo-class.')

export const cssPropertyField = (): Schema<Css> =>
  oneOf(CSS_PROPERTIES, 'cssProperty').desc('CSS property, in kebab-case.')

export const styleValueField = (): Schema<string | undefined> =>
  str()
    .optional()
    .desc(
      'New value. Omit to remove the property. May reference a theme variable as ' +
        '${variable-name} — see read({theme:true}).',
    )

export const routeField = (): Schema<string> =>
  str().desc('Page route, starting with "/". See read({site:true}).')

export const mixinIdField = (): Schema<string> =>
  str().desc('Style mixin id, e.g. "my-site-s-4". See read({mixins:true}).')

export const behaviorIdField = (): Schema<string> =>
  str().desc('Behavior id, e.g. "my-site-b-3". See read({behaviors:true}).')

export const tagField = (): Schema<Tag> => oneOf(TAGS, 'tag').desc('HTML tag.')
