import { HandlerCallback } from '../types/handler-callback'
import { getObjectKeys } from './get-object-keys'
import { ObjectKey } from '../types/object-key'
import { Config } from '../types/config'
import { merge } from './merge'

export function combine<Selection extends ObjectKey>(...configs: Config<Selection | symbol, HandlerCallback<Error>>[]) {
  const configTemplate = Object.fromEntries<HandlerCallback<Error>[]>(
    getObjectKeys(merge(...configs)).map((key) => [key, []])
  ) as Record<Selection, HandlerCallback<Error>[]>

  configs.forEach(config => {
    const keys = getObjectKeys(config) as Selection[]
    
    keys.forEach((key: Selection) => {
      const callback = config[key]

      if (!callback) return
      
      configTemplate[key].push(callback)
    })
  })

  const combinedConfig = Object.fromEntries<HandlerCallback<Error>>(
    getObjectKeys(configTemplate)
      .map((key: ObjectKey) => {
        if (!configTemplate[key as Selection]) return [key, () => {}]
        
        const combinedCallback = (error: Error) => {
          configTemplate[key as Selection].forEach(callback => callback(error))
        }

        return [key as Selection, combinedCallback]
      })
  )

  return combinedConfig as Config<Selection | symbol, HandlerCallback<Error>>
}