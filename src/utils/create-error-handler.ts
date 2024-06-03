import { HandlerCallback } from '../types/handler-callback'
import { mapRecordToMap } from './map-record-to-map'
import { ObjectKey } from '../types/object-key'
import { Selector } from '../types/selector'

export function createErrorHandler<Error, Selection extends ObjectKey>(selector: Selector<Error, Selection>) {
  return (config: Record<Selection, HandlerCallback<Error>>) => {
    const configMap = mapRecordToMap(config)

    return (error: Error) => {
      const handlerCallback = configMap.get(selector(error))
      if (!handlerCallback) return

      handlerCallback(error)
    }
  }
}
