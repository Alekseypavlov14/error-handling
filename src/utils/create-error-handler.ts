import { HandlerCallback } from '../types/handler-callback'
import { mapConfigToMap } from './map-config-to-map'
import { ObjectKey } from '../types/object-key'
import { Selector } from '../types/selector'
import { Config } from '../types/config'

export function createErrorHandler<Error, Selection extends ObjectKey>(selector: Selector<Error, Selection>) {
  return (config: Config<Selection, HandlerCallback<Error>>) => {
    const configMap = mapConfigToMap(config)

    return (error: Error) => {
      const handlerCallback = configMap.get(selector(error))
      if (!handlerCallback) return

      handlerCallback(error)
    }
  }
}
