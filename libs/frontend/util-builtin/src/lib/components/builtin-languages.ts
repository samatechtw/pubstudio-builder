import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  caretBubbleStyleId,
  caretRightStyleId,
  langDisplayStyleId,
  langOptionsStyleId,
  langOptionStyleId,
  langTextStyleId,
  languagesId,
  selectLanguageBehaviorId,
  setupLanguageBehaviorId,
  tempChildId,
} from '@pubstudio/frontend/util-ids'
import { ComponentEventType, IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const langDisplayStyle: IStyle = {
  id: langDisplayStyleId,
  name: 'LanguageDisplay',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'align-items': 'center',
        cursor: 'pointer',
        display: 'flex',
        'flex-direction': 'row',
        padding: '6px 8px 6px 8px',
        'user-select': 'none',
        border: 'none',
        position: 'relative',
      },
    },
  },
}

export const langTextStyle: IStyle = {
  id: langTextStyleId,
  name: 'LangText',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        color: '${color-text}',
        display: 'flex',
        'font-family': '${font-text}',
        'font-size': '${size-text}',
        margin: '0px',
      },
    },
  },
}

export const caretRightStyle: IStyle = {
  id: caretRightStyleId,
  name: 'CaretRight',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'border-left': '5px solid rgba(0,0,0,0)',
        'border-right': '5px solid rgba(0,0,0,0)',
        'border-top': '6px solid #000',
        height: '0',
        margin: '0px 0px 0px 6px',
        width: '0',
      },
    },
  },
}

export const caretBubbleStyle: IStyle = {
  id: caretBubbleStyleId,
  name: 'CaretBubble',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'border-left': '8px solid rgba(0,0,0,0)',
        'border-right': '8px solid rgba(0,0,0,0)',
        'border-bottom': '8px solid #fff',
        height: '0',
        margin: '0px 0px 0px 6px',
        position: 'absolute',
        right: '24px',
        top: '-7px',
        width: '0',
      },
    },
  },
}

export const langOptionsStyle: IStyle = {
  id: langOptionsStyleId,
  name: 'LangOption',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'background-color': 'white',
        'border-radius': '12px',
        bottom: '-px',
        'box-shadow': '0 6px 24px rgba(0,0,0,0.2)',
        'align-items': 'center',
        display: 'flex',
        'flex-direction': 'row',
        'flex-wrap': 'wrap',
        'min-width': '240px',
        padding: '10px 16px 8px 16px',
        position: 'absolute',
        right: '0',
      },
    },
  },
}

export const langOptionStyle: IStyle = {
  id: langOptionStyleId,
  name: 'LangOption',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        'align-items': 'center',
        color: '${color-text}',
        cursor: 'pointer',
        display: 'flex',
        'font-family': '${font-text}',
        'font-size': '${size-text}',
        'justify-content': 'center',
        margin: '0px',
        'user-select': 'none',
        width: '50%',
      },
    },
  },
}

interface IMakeLanguagesOptions {
  defaultLang: string
  languageEntries: string[][]
}

const makeLangOption = (lang: string[]): IComponent => {
  return {
    id: tempChildId,
    name: 'Option',
    tag: Tag.Div,
    content: lang[1],
    style: { custom: {}, mixins: [langOptionStyleId] },
    events: {
      [ComponentEventType.Click]: {
        name: ComponentEventType.Click,
        behaviors: [
          { behaviorId: selectLanguageBehaviorId, args: { language: lang[0] } },
        ],
      },
    },
  }
}

export const makeLanguages = (options: IMakeLanguagesOptions): IComponent => {
  return {
    id: languagesId,
    name: 'LangWrap',
    tag: Tag.Div,
    style: {
      custom: { [DEFAULT_BREAKPOINT_ID]: { default: { position: 'relative' } } },
    },
    children: [
      {
        id: tempChildId,
        name: 'Lang',
        tag: Tag.Div,
        style: { custom: {}, mixins: [langDisplayStyleId] },
        children: [
          {
            id: tempChildId,
            name: 'LangText',
            tag: Tag.Div,
            content: options.defaultLang,
            style: { custom: {}, mixins: [langTextStyleId] },
            events: {
              [ComponentEventType.OnAppear]: {
                name: ComponentEventType.OnAppear,
                behaviors: [{ behaviorId: setupLanguageBehaviorId }],
              },
            },
          },
          {
            id: tempChildId,
            name: 'Caret',
            tag: Tag.Div,
            style: { custom: {}, mixins: [caretRightStyleId] },
          },
        ],
      },
      {
        id: tempChildId,
        name: 'LangOptions',
        tag: Tag.Div,
        style: { custom: {}, mixins: [langOptionsStyleId] },
        state: { hide: true },
        children: [
          {
            id: tempChildId,
            name: 'Caret',
            tag: Tag.Div,
            style: { custom: {}, mixins: [caretBubbleStyleId] },
          },
          ...options.languageEntries.map((lang) => makeLangOption(lang)),
        ],
      },
    ],
  }
}
