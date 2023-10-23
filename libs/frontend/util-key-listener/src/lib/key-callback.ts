import { Keys } from './enum-keys'

export type KeyCallback = (event: KeyboardEvent, keys: Keys[]) => void
