import { IEventParams } from './i-component'

export type EventHandler = (e?: Event) => void

export type ICustomEvents = Record<string, [EventHandler, IEventParams | undefined]>

export interface IEventCollection {
  native: Record<string, EventHandler>
  custom: ICustomEvents
}
