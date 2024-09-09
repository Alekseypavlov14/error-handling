import { HandlerCallback } from '../types/handler-callback'
import { ObjectKey } from '../types/object-key'
import { Config } from '../types/config'
import { merge } from './merge'

export function combine<Selection extends ObjectKey>(...configs: Config<Selection, HandlerCallback<Error>>[]) {
  const configTemplate = Object.fromEntries<HandlerCallback<Error>[]>(
    Object.keys(merge(...configs)).map((key) => [key, []])
  ) as Record<Selection, HandlerCallback<Error>[]>

  configs.forEach(config => {
    const keys = Object.keys(config) as Selection[]
    
    keys.forEach((key: Selection) => {
      const callback = config[key]

      if (!callback) return
      
      configTemplate[key].push(callback)
    })
  })

  const combinedConfig = Object.fromEntries<HandlerCallback<Error>>(
    Object.keys(configTemplate)
      .map((key: string) => {
        if (!configTemplate[key as Selection]) return [key, () => {}]
        
        const combinedCallback = (error: Error) => {
          configTemplate[key as Selection].forEach(callback => callback(error))
        }

        return [key as Selection, combinedCallback]
      })
  )

  return combinedConfig as Config<Selection, HandlerCallback<Error>>
}