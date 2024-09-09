import { getConfigSymbolicSlice } from './get-config-symbolic-slice'
import { HandlerCallback } from '../types/handler-callback'
import { deepMerge } from '@oleksii-pavlov/deep-merge'
import { ObjectKey } from '../types/object-key'
import { Config } from '../types/config'

export function merge<Selection extends ObjectKey>(...configs: Config<Selection | symbol, HandlerCallback<Error>>[]) {  
  const mergedConfig = deepMerge<Config<Selection | symbol, HandlerCallback<Error>>>(...configs)
  
  const symbolicConfigSlices = configs.map(getConfigSymbolicSlice)
  
  return Object.assign({}, mergedConfig, ...symbolicConfigSlices) as Config<Selection | symbol, HandlerCallback<Error>>
}
