import { ObjectKey } from '../types/object-key'
import { Config } from '../types/config'

export function mapConfigToMap<K extends ObjectKey, V>(config: Config<K, V>): Map<K, V> {
  return new Map<K, V>(Object.entries(config) as [K, V][])
}
