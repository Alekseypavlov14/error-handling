import { ObjectKey } from '../types/object-key'

export function mapRecordToMap<K extends ObjectKey, V>(object: Record<K, V>): Map<K, V> {
  return new Map<K, V>(Object.entries(object) as [K, V][])
}
