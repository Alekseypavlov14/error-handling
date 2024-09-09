import { alwaysHandler, defaultHandler } from '../constants'
import { HandlerCallback } from '../types/handler-callback'
import { ObjectKey } from '../types/object-key'
import { Config } from '../types/config'

export function getConfigSymbolicSlice<Selection extends ObjectKey>(config: Config<Selection | symbol, HandlerCallback<Error>>) {
  const slice: Record<symbol, HandlerCallback<Error>> = {}

  if (config[defaultHandler]) slice[defaultHandler] = config[defaultHandler]
  if (config[alwaysHandler]) slice[alwaysHandler] = config[alwaysHandler]

  return slice
}