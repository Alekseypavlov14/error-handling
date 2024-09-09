import { ObjectKey } from '../types/object-key'

export function getObjectKeys<T extends {}>(object: T): ObjectKey[] {
  const properties = Object.getOwnPropertyNames(object)
  const symbols = Object.getOwnPropertySymbols(object)

  return [...properties, ...symbols]
}
