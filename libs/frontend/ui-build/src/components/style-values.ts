// Items listed here will be used to populate the dropdown in editor, disabling users
// from entering custom values.

import { Css } from '@pubstudio/shared/type-site'

// Only non-numeric, dynamic values should be listed here.
const OVERFLOW = ['auto', 'hidden', 'scroll', 'visible']
export const CSS_VALUES = new Map<Css, string[]>([
  [
    Css.AlignContent,
    ['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch'],
  ],
  [Css.AlignItems, ['baseline', 'center', 'flex-end', 'flex-start', 'stretch']],
  [Css.AlignSelf, ['baseline', 'center', 'flex-end', 'flex-start', 'stretch']],
  [Css.BackgroundOrigin, ['border-box', 'content-box', 'padding-box']],
  [Css.Cursor, ['auto', 'default', 'none', 'pointer', 'text']],
  [Css.Display, ['block', 'flex', 'grid', 'inline', 'inline-block', 'none']],
  [Css.FlexDirection, ['column', 'column-reverse', 'row', 'row-reverse']],
  [Css.FlexWrap, ['nowrap', 'wrap', 'wrap-reverse']],
  [Css.FontStyle, ['italic', 'normal']],
  [Css.FontWeight, ['100', '300', '400', '500', '600', '700']],
  [
    Css.JustifyContent,
    ['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch'],
  ],
  [Css.GridAutoFlow, ['row', 'column', 'dense', 'row dense', 'column dense']],
  [Css.ObjectFit, ['contain', 'cover', 'fill', 'none', 'scale-down']],
  [Css.Overflow, OVERFLOW],
  [Css.OverflowX, OVERFLOW],
  [Css.OverflowY, OVERFLOW],
  [Css.PointerEvents, ['auto', 'none']],
  [Css.Position, ['absolute', 'fixed', 'relative', 'static', 'sticky']],
  [Css.ScrollBehavior, ['auto', 'smooth']],
  [Css.TextAlign, ['start', 'end', 'justify', 'center']],
  [Css.TextOverflow, ['clip', 'ellipsis']],
  [Css.TextTransform, ['capitalize', 'uppercase', 'lowercase', 'none', 'full-width']],
  [Css.UserSelect, ['all', 'auto', 'none', 'text']],
  [Css.Visibility, ['hidden', 'visible']],
  [Css.WebkitBackgroundClip, ['border-box', 'padding-box', 'content-box', 'text']],
  [Css.WhiteSpace, ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap']],
  [Css.WordBreak, ['break-word', 'break-all', 'keep-all', 'auto-phrase', 'normal']],
  [Css.WordWrap, ['break-word', 'normal']],
])
