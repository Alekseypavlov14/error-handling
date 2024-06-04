import { ObjectKey } from './object-key'

export type Config<K extends ObjectKey, V> = {
  [key in K]?: V
}