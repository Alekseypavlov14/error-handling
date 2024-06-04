import { executeWithErrorHandler } from './execute-with-error-handler'
import { HandlerCallback } from '../types/handler-callback'

export function wrapWithErrorHandler<Error>(callback: VoidFunction, handler: HandlerCallback<Error>) {
  return () => executeWithErrorHandler(callback, handler)
}
