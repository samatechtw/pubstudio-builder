import {
  buttonId,
  buttonStyleId,
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
import { ComponentArgPrimitive, IComponentInput, Tag } from '@pubstudio/shared/type-site'
import { makeH2 } from './builtin-h'

const makePlaceholder = (text: string): IComponentInput => {
  return {
    type: ComponentArgPrimitive.String,
    name: 'placeholder',
    attr: true,
    default: '',
    is: text,
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
      tag: Tag.Div,
      children: [
        makeH2('ContactFormTitle', '<div class="pm-p">Get in touch.</div>', {
          [DEFAULT_BREAKPOINT_ID]: {
            default: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
            },
          },
        }),
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
                      margin: '24px 6px 0px 0px',
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
                placeholder: makePlaceholder('Email'),
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
                      margin: '24px 0px 0px 6px',
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
                placeholder: makePlaceholder('Name (optional)'),
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
            placeholder: makePlaceholder('Message'),
            rows: {
              name: 'rows',
              type: ComponentArgPrimitive.String,
              default: '3',
              attr: true,
              is: '8',
            },
          },
        },
        {
          id: buttonId,
          name: 'Submit',
          tag: Tag.Button,
          content: '<div class="pm-p">Submit</div>',
          style: {
            custom: {
              [DEFAULT_BREAKPOINT_ID]: {
                default: {
                  margin: '32px 0px 0px 0px',
                  'background-color': '${color-primary}',
                  'border-radius': '0px',
                  color: 'white',
                  'font-size': '18px',
                },
              },
            },
            mixins: [buttonStyleId],
          },
          inputs: {
            type: {
              name: 'type',
              type: ComponentArgPrimitive.String,
              default: 'submit',
              attr: true,
              is: 'submit',
            },
          },
        },
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