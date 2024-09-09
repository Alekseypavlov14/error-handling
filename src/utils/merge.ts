import { HandlerCallback } from '../types/handler-callback'
import { ObjectKey } from '../types/object-key'
import { deepMerge } from '@oleksii-pavlov/deep-merge'
import { Config } from '../types/config'

export function merge<Selection extends ObjectKey>(...configs: Config<Selection, HandlerCallback<Error>>[]) {
  return deepMerge<Config<Selection, HandlerCallback<Error>>>(...configs)
}
