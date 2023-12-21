import { ComponentArgPrimitive, IComponentInputs } from '@pubstudio/shared/type-site'

export const defaultLinkInputs = (href?: string): IComponentInputs => {
  return {
    href: {
      type: ComponentArgPrimitive.String,
      name: 'href',
      attr: true,
      default: '',
      is: href ?? '',
    },
  }
}

export const defaultImageInputs = (src?: string): IComponentInputs => {
  return {
    src: {
      type: ComponentArgPrimitive.String,
      name: 'src',
      attr: true,
      default: '',
      is: src ?? '',
    },
  }
}

export const defaultInputInputs = (placeholder?: string): IComponentInputs => {
  return {
    placeholder: {
      type: ComponentArgPrimitive.String,
      name: 'placeholder',
      attr: true,
      default: '',
      is: placeholder ?? '',
    },
  }
}

export const defaultTextareaInputs = (placeholder?: string): IComponentInputs => {
  return {
    placeholder: {
      type: ComponentArgPrimitive.String,
      name: 'placeholder',
      attr: true,
      default: '',
      is: placeholder ?? '',
    },
    rows: {
      type: ComponentArgPrimitive.String,
      name: 'rows',
      attr: true,
      default: '4',
      is: '',
    },
  }
}

export const defaultNavMenuItemInputs = (
  href?: string,
  name?: string,
  sync?: boolean,
): IComponentInputs => {
  return {
    href: {
      type: ComponentArgPrimitive.String,
      name: 'href',
      attr: true,
      default: '',
      is: href ?? '',
    },
    name: {
      type: ComponentArgPrimitive.String,
      name: 'name',
      default: '',
      is: name ?? '',
    },
    sync: {
      type: ComponentArgPrimitive.Boolean,
      name: 'sync',
      default: false,
      is: sync ?? false,
    },
  }
}
