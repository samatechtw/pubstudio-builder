export enum ComponentEventType {
  Click = 'click',
  ClickOutside = 'clickOutside',
  MouseOver = 'mouseover',
  MouseLeave = 'mouseleave',
  Periodic = 'periodic',
  OnAppear = 'appear',
  ScrollIntoView = 'scrollIntoView',
  Input = 'input',
  Submit = 'submit',
}

export const ComponentEventTypeValues: ComponentEventType[] =
  Object.values(ComponentEventType)
