import { executeWithErrorHandler } from '../utils/execute-with-error-handler'
import { wrapWithErrorHandler } from '../utils/wrap-with-error-handler'
import { createErrorHandler } from '../utils/create-error-handler'

// helping code
type ErrorMessage = 'Not found' | 'Server error'
class TestError extends Error {
  constructor (public readonly message: ErrorMessage) {
    super(message)
  }
}
function callbackWithNotFoundError() {
  throw new TestError('Not found')
}
function callbackWithServerError() {
  throw new TestError('Server error')
}
function testErrorSelector(testError: TestError) {
  return testError.message
}
const handleTestError = createErrorHandler<TestError, ErrorMessage>(testErrorSelector)

// Tests
test('Test how config categorizes error', () => {
  let counter = 0
  
  executeWithErrorHandler(callbackWithNotFoundError, handleTestError({
    "Not found": () => counter++,
    "Server error": () => {}
  }))

  executeWithErrorHandler(callbackWithServerError, handleTestError({
    "Not found": () => {},
    "Server error": () => counter++
  }))

  expect(counter).toBe(2)
})

test('Test async callbacks handling', async () => {
  async function asyncCallbackWithNotFoundError() {
    return new Promise((resolve, reject) => reject(callbackWithNotFoundError()))
  }

  let counter = 0

  const callback1 = wrapWithErrorHandler(asyncCallbackWithNotFoundError, handleTestError({
    "Not found": () => counter++,
    "Server error": () => {}
  }))

  await callback1()

  expect(counter).toBe(1)
})