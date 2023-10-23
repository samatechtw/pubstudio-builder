export enum ComponentEventType {
  Click = 'click',
  ClickOutside = 'clickOutside',
  MouseOver = 'mouseover',
  MouseLeave = 'mouseleave',
  Periodic = 'periodic',
  OnAppear = 'appear',
  ScrollIntoView = 'scrollIntoView',
  Input = 'input',
}

export const ComponentEventTypeValues: ComponentEventType[] =
  Object.values(ComponentEventType)
