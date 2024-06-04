import { alwaysHandler, defaultHandler } from '../constants'
import { HandlerCallback } from '../types/handler-callback'
import { ObjectKey } from '../types/object-key'
import { Selector } from '../types/selector'
import { Config } from '../types/config'

export function createErrorHandler<Error, Selection extends ObjectKey>(selector: Selector<Error, Selection>) {
  return (config: Config<Selection | symbol, HandlerCallback<Error>>) => {

    return (error: Error) => {
      const handlerCallback = config[selector(error)]
      const defaultHandlerCallback = config[defaultHandler] 
      const alwaysHandlerCallback = config[alwaysHandler]

      if (handlerCallback) handlerCallback(error)
      if (!handlerCallback && defaultHandlerCallback) defaultHandlerCallback(error)
      if (alwaysHandlerCallback) alwaysHandlerCallback(error)
    }
  }
}
