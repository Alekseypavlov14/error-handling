import { HandlerCallback } from '../types/handler-callback'

export function executeWithErrorHandler<Error>(callback: VoidFunction, handler: HandlerCallback<Error>) {
  try {
    callback()
  } catch(error) {
    handler(error as Error)
  }
}
