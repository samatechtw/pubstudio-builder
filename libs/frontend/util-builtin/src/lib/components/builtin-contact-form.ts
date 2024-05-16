import {
  contactFormId,
  containerHorizontalId,
  containerVerticalId,
  DEFAULT_BREAKPOINT_ID,
  horizontalStyleId,
  inputId,
  inputStyleId,
  textareaId,
  textareaStyleId,
  verticalStyleId,
} from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  IBreakpointStyles,
  IRawStyle,
  Tag,
} from '@pubstudio/shared/type-site'
import { makeButton } from './builtin-button'
import { makeH2 } from './builtin-h'
import { makeText } from './builtin-text'
import { makeInput } from './helpers'

const defaultStyle = (raw: IRawStyle): IBreakpointStyles => {
  return {
    [DEFAULT_BREAKPOINT_ID]: {
      default: raw,
    },
  }
}

export const contactForm = {
  id: contactFormId,
  name: 'ContactFormWrap',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          'background-color': '#F0F0F0',
          'align-items': 'center',
          padding: '50px 0px 56px 0px',
          width: '100%',
          height: 'auto',
        },
      },
      'breakpoint-4': {
        default: {
          display: 'flex',
          width: '100%',
          margin: '0px 0px 0px 0px',
          'background-color': 'transparent',
        },
      },
      'breakpoint-3': {
        default: {
          width: '100%',
        },
      },
    },
    mixins: [verticalStyleId],
  },
  children: [
    {
      id: containerVerticalId,
      name: 'ContactForm',
      tag: Tag.Form,
      children: [
        makeH2(
          'ContactFormTitle',
          '<div class="pm-p">Get in touch.</div>',
          defaultStyle({
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          }),
        ),
        {
          id: containerHorizontalId,
          name: 'ContainerHorizontal',
          tag: Tag.Div,
          children: [
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
                      margin: '24px 0px 0px 12px',
                      border: '1px solid #4F4F4F',
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
          ],
          style: {
            custom: {
              [DEFAULT_BREAKPOINT_ID]: {
                default: {
                  width: '85%',
                  height: 'auto',
                },
              },
              'breakpoint-3': {
                default: {
                  'flex-direction': 'column',
                },
              },
            },
            mixins: [horizontalStyleId],
          },
        },
        {
          id: textareaId,
          name: 'Message',
          tag: Tag.Textarea,
          style: {
            custom: {
              [DEFAULT_BREAKPOINT_ID]: {
                default: {
                  margin: '24px 0px 0px 0px',
                  border: ' 1px solid #4F4F4F',
                  width: '85%',
                },
              },
            },
            mixins: [textareaStyleId],
          },
          inputs: {
            placeholder: makeInput('placeholder', 'Message'),
            name: makeInput('name', 'contact-message'),
            rows: {
              name: 'rows',
              type: ComponentArgPrimitive.String,
              default: '3',
              attr: true,
              is: '8',
            },
          },
        },
        makeText(
          'ContactFormError',
          'Contact form error',
          defaultStyle({
            display: 'flex',
            margin: '16px 0px 16px 0px',
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
          content: '<div class="pm-p">Submit</div>',
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
    },
  ],
}
