import { wrapCallbackWithPromise } from './wrap-callback-with-promise'
import { HandlerCallback } from '../types/handler-callback'

export function wrapWithErrorHandler<Error>(callback: VoidFunction, handler: HandlerCallback<Error>) {
  return () => {
    const callbackResult = wrapCallbackWithPromise(callback)
    callbackResult.catch(handler)
  }
}
