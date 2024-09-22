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

test('Test merge function with alwaysHandler and defaultHandler', () => {
  let counter = 0

  const configA = {
    "Not found": () => counter++,
    [defaultHandler]: () => counter += 2,
  }

  const configB = {
    "Server error": () => counter++,
    [alwaysHandler]: () => counter += 3,
  }

  const mergedConfig = merge(configA, configB)
  const errorHandler = handleTestError(mergedConfig)

  const testErrorNotFound = new TestError("Not found")
  const testErrorServerError = new TestError("Server error")
  const testErrorUnauthorized = new TestError("Unauthorized")
  
  errorHandler(testErrorNotFound)
  errorHandler(testErrorServerError)
  errorHandler(testErrorUnauthorized)

  expect(counter).toBe(13)
})

test('Test combine function with alwaysHandler and defaultHandler', () => {
  let counter = 0

  const configA = {
    "Not found": () => counter++,
    [alwaysHandler]: () => counter += 2,
  }

  const configB = {
    "Not found": () => counter += 2,
    [defaultHandler]: () => counter += 3,
  }

  const combinedConfig = combine(configA, configB)
  const errorHandler = handleTestError(combinedConfig)

  const testErrorNotFound = new TestError("Not found")
  const testErrorServerError = new TestError("Server error")

  errorHandler(testErrorNotFound)
  errorHandler(testErrorServerError)

  expect(counter).toBe(10)
})

test('Test merge and combine together with alwaysHandler and defaultHandler', () => {
  let counter = 0

  const configA = {
    "Not found": () => counter++,
    "Server error": () => counter += 2,
    [alwaysHandler]: () => counter++,
  }

  const configB = {
    "Not found": () => counter += 2,
    [defaultHandler]: () => counter += 3,
  }

  const configC = {
    "Unauthorized": () => counter += 3,
    [alwaysHandler]: () => counter++,
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

  expect(counter).toBe(13)
})

test('Test unexpected error case', async () => {
  let counter = 0
  
  const config = {
    "Not found": () => counter++,
    [defaultHandler]: () => counter += 2,
    [alwaysHandler]: () => counter++,
  }

  const errorHandler = handleTestError(config)

  async function request() {
    return await new Promise<number>((res, rej) => rej(new SyntaxError("Unauthorized")))
  }

  await request().catch(errorHandler)

  expect(counter).toBe(3)
})

test('Test promise rejection with error handling', async () => {
  let counter = 0;

  async function asyncCallbackWithNotFoundError() {
    return new Promise((_, reject) => reject(new TestError("Not found")));
  }

  await asyncCallbackWithNotFoundError().catch(handleTestError({
    "Not found": () => counter++,
    "Server error": () => {}
  }));

  expect(counter).toBe(1);
});

test('Test promise rejection with defaultHandler in .catch()', async () => {
  let counter = 0;

  async function asyncCallbackWithUnauthorizedError() {
    return new Promise((_, reject) => reject(new TestError("Unauthorized")));
  }

  await asyncCallbackWithUnauthorizedError().catch(handleTestError({
    "Not found": () => {},
    [defaultHandler]: () => counter += 2,
  }));

  expect(counter).toBe(2);
});

test('Test promise rejection with alwaysHandler in .catch()', async () => {
  let counter = 0;

  async function asyncCallbackWithServerError() {
    return new Promise((_, reject) => reject(new TestError("Server error")));
  }

  await asyncCallbackWithServerError().catch(handleTestError({
    "Server error": () => counter++,
    [alwaysHandler]: () => counter += 2,
  }));

  expect(counter).toBe(3);
});

test('Test promise rejection with unexpected error in .catch()', async () => {
  let counter = 0;

  async function asyncCallbackWithUnexpectedError() {
    return new Promise((_, reject) => reject(new TestError("Unauthorized")));
  }

  await asyncCallbackWithUnexpectedError().catch(handleTestError({
    "Not found": () => {},
    [defaultHandler]: () => counter += 2,
    [alwaysHandler]: () => counter++,
  }));

  expect(counter).toBe(3); // 2 from defaultHandler, 1 from alwaysHandler
});

