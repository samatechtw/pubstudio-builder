export enum ComponentEventType {
  Click = 'click',
  Load = 'load',
  Error = 'error',
  ClickOutside = 'clickOutside',
  MouseOver = 'mouseover',
  MouseLeave = 'mouseleave',
  Periodic = 'periodic',
  OnAppear = 'appear',
  Scroll = 'scroll',
  ScrollIntoView = 'scrollIntoView',
  Input = 'input',
  Submit = 'submit',
  Keyup = 'keyup',
  Keydown = 'keydown',
}

export type ComponentEventTypeType = `${ComponentEventType}`
