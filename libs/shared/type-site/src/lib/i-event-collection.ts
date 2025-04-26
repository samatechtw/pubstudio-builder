import { ComponentEventTypeType } from './enum-component-event-type'
import { IEventParams } from './i-component'

export type EventHandler = (e?: Event) => void

export type ICustomEvents = Partial<
  Record<ComponentEventTypeType, [EventHandler, IEventParams | undefined]>
>

export interface IEventCollection {
  native: Record<string, EventHandler>
  custom: ICustomEvents
}
