import { alwaysHandler, defaultHandler } from '../constants'
import { executeWithErrorHandler } from '../utils/execute-with-error-handler'
import { wrapWithErrorHandler } from '../utils/wrap-with-error-handler'
import { createErrorHandler } from '../utils/create-error-handler'
import { combine } from '../utils/combine'
import { merge } from '../utils/merge'

// Helping code
type ErrorMessage = 'Not found' | 'Server error' | 'Unauthorized'
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
function callbackWithUnauthorizedError() {
  throw new TestError('Unauthorized')
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

test('Test special handler: defaultHandler', () => {
  let counter = 0
  
  executeWithErrorHandler(callbackWithNotFoundError, handleTestError({
    "Server error": () => {},
    [defaultHandler]: () => counter++
  }))

  expect(counter).toBe(1)
})

test('Test special handler: alwaysHandler', () => {
  let counter = 0
  
  executeWithErrorHandler(callbackWithNotFoundError, handleTestError({
    "Server error": () => {},
    "Not found": () => counter++,
    [alwaysHandler]: () => counter++
  }))

  expect(counter).toBe(2)
})

test('Test merge function', () => {
  let counter = 0

  const configA = {
    "Not found": () => counter++,
  }

  const configB = {
    "Server error": () => counter++,
  }

  const mergedConfig = merge(configA, configB)
  const errorHandler = handleTestError(mergedConfig)

  const testErrorNotFound = new TestError("Not found")
  const testErrorServerError = new TestError("Server error")

  errorHandler(testErrorNotFound)
  errorHandler(testErrorServerError)

  expect(counter).toBe(2)
})

test('Test combine function', () => {
  let counter = 0

  const configA = {
    "Not found": () => counter++,
  }

  const configB = {
    "Not found": () => counter += 2,
  }

  const combinedConfig = combine(configA, configB)
  const errorHandler = handleTestError(combinedConfig)

  const testErrorNotFound = new TestError("Not found")

  errorHandler(testErrorNotFound)

  expect(counter).toBe(3)
})

test('Test merge and combine together', () => {
  let counter = 0

  const configA = {
    "Not found": () => counter++,
    "Server error": () => counter += 2,
  }

  const configB = {
    "Not found": () => counter += 2,
  }

  const configC = {
    "Unauthorized": () => counter += 3,
  }

  const mergedConfig = merge(configA, configB)
  const combinedConfig = combine<TestError['message']>(mergedConfig, configC)
  const errorHandler = handleTestError(combinedConfig)

  const testErrorNotFound = new TestError("Not found")
  const testErrorServerError = new TestError("Server error")
  const testErrorUnauthorized = new TestError("Unauthorized")

  errorHandler(testErrorNotFound)
  errorHandler(testErrorServerError)
  errorHandler(testErrorUnauthorized)

  expect(counter).toBe(7)
})
