import { HandlerCallback } from '../types/handler-callback'

export async function executeWithErrorHandler<Error>(callback: VoidFunction, handler: HandlerCallback<Error>) {
  try {
    await callback()
  } catch(error) {
    handler(error as Error)
  }
}
