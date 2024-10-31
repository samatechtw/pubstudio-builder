import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  inputId,
  inputStyleId,
  mailingListId,
  verticalStyleId,
} from '@pubstudio/frontend/util-ids'
import { Tag } from '@pubstudio/shared/type-site'
import { makeButton } from './builtin-button'
import { makeH2 } from './builtin-h'
import { makeText } from './builtin-text'
import { defaultStyle, makeInput } from './helpers'

export const mailingList = {
  id: mailingListId,
  name: 'MailingList',
  tag: Tag.Form,
  children: [
    makeH2(
      'ContactFormTitle',
      '<div class="pm-p">Subscribe for updates.</div>',
      defaultStyle({
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      }),
    ),
    {
      id: inputId,
      name: 'Email',
      tag: Tag.Input,
      style: {
        custom: {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {
              border: '1px solid #4F4F4F',
              margin: '24px 0px 0px 0px',
              width: '240px',
              'max-width': '100%',
              flex: '1 1 0',
            },
          },
          'breakpoint-3': {
            default: {
              margin: '52px 0px 0px 0px',
              border: '1px solid #4F4F4F',
              width: '85%',
            },
          },
        },
        mixins: [inputStyleId],
      },
      inputs: {
        placeholder: makeInput('placeholder', 'Email'),
        name: makeInput('name', 'contact-email'),
      },
    },
    {
      id: inputId,
      name: 'Name',
      tag: Tag.Input,
      style: {
        custom: {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {
              margin: '24px 0px 0px 0px',
              border: '1px solid #4F4F4F',
              width: '240px',
              'max-width': '100%',
              flex: '1 1 0',
            },
          },
          'breakpoint-3': {
            default: {
              margin: '24px 0px 0px 0px',
              width: '100%',
            },
          },
        },
        mixins: [inputStyleId],
      },
      inputs: {
        placeholder: makeInput('placeholder', 'Name (optional)'),
        name: makeInput('name', 'contact-name'),
      },
    },
    makeText(
      'MailingListError',
      'Mailing list error',
      defaultStyle({
        display: 'flex',
        margin: '10px 0px 10px 0px',
        color: '${color-error}',
        'justify-content': 'center',
        opacity: '0',
        'font-size': '14px',
        'min-height': '18px',
        transition: 'opacity 0.25s ease',
      }),
    ),
    makeButton({
      name: 'Submit',
      content: '<div class="pm-p">Subscribe</div>',
      style: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            margin: '0px 0px 0px 0px',
            'border-radius': '0px',
            color: 'white',
            'font-size': '18px',
          },
        },
      },
      events: {},
    }),
  ],
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          width: '70%',
          'align-items': 'center',
          height: 'auto',
          'background-color': '#D0D0D0',
          padding: '24px 22px 24px 22px',
          margin: '0px auto 0px auto',
          'max-width': '900px',
          'min-width': '400px',
        },
      },
      'breakpoint-4': {
        default: {
          'min-width': '100%',
        },
      },
    },
    mixins: [verticalStyleId],
  },
}
