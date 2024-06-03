import { VoidFunction } from '../types/void-function'

export function wrapCallbackWithPromise(callback: VoidFunction) {
  return new Promise((resolve, reject) => {
    try {
      resolve(callback())
    } catch (error) {
      reject(error)
    }
  })
}
