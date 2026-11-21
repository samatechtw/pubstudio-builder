import { IComponent, TagType } from '@pubstudio/shared/type-site'

export const maxLinesInput = 'pubstudio:max-lines'

const textTags = new Set<TagType>([
  'a',
  'button',
  'div',
  'footer',
  'Form',
  'header',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
  'li',
  'p',
  'span',
])

export const supportsMaxLines = (tag: TagType) => textTags.has(tag)

export const getMaxLines = (component: IComponent, source?: IComponent) => {
  const input = component.inputs?.[maxLinesInput] ?? source?.inputs?.[maxLinesInput]
  const value = input?.is
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) {
    return value
  }
}

export const lineClampStyle = (lines: number) => ({
  display: '-webkit-box',
  '-webkit-box-orient': 'vertical',
  '-webkit-line-clamp': String(lines),
  overflow: 'hidden',
  minWidth: '0',
})
