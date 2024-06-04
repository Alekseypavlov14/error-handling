# @oleksii-pavlov/error-handling

`@oleksii-pavlov/error-handling` is a utility library designed to streamline the handling of errors in JavaScript and TypeScript applications. It provides flexible mechanisms for categorizing errors and executing specific handlers based on error types.

## Installation

To install `@oleksii-pavlov/error-handling`, use npm or yarn:

```bash
npm install @oleksii-pavlov/error-handling
```

or

```bash
yarn add @oleksii-pavlov/error-handling
```

## Usage

### Basic example

```typescript
import { createErrorHandler, executeWithErrorHandler } from '@oleksii-pavlov/error-handling'

const handleHTTPErrors = createErrorHandler<HTTPError, number>(error => error.code)

apiRequest.catch(handleHTTPErrors({
  400: () => console.log('bad request'),
  500: () => console.log('server error')
}))

// or 

executeWithErrorHandler(apiRequest, handleHTTPErrors({
  400: () => console.log('bad request'),
  500: () => console.log('server error')
}))

// Note: 'HTTPError' type and 'apiRequest' function have to be provided by client code
```

### Step-by-step instruction

Firstly, let's define a custom error. For example, we can define **HTTPError** class that extends default **Error**. We throw this error if a fetch goes wrong:

```typescript
class HTTPError extends Error {
  constructor(public readonly status: number) {
    super() // execute Error constructor
  }
}
```

Let's define HTTP service util that **throws our custom error**:

```typescript
class HTTPService {
  static get(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new HTTPError(response.status)

        return response.json()
      })
  }

  // ... other methods ...
}
```

Now, we have to create an **error handler**. As we know the **type of error** that we want to handle, we need to define **differentiating** callback. For this, we create a **handleHTTPErrors** callback. For this, import **createErrorHandler** util:

```typescript
import { createErrorHandler } from '@oleksii-pavlov/error-handling'

const handleHTTPErrors = createErrorHandler<HTTPError, number>(error => error.status)
```

And the last one, we have to combine all previous code. Now, we can execute API requests safely. Let's imagine that we have a **createUserAPIRequest** that is build on HTTPService. So, we can have this code:

```typescript
createUserAPIRequest(userData).catch(handleHTTPErrors({
  400: () => console.log('Bad request'),
  500: () => console.log('Oops, server error, try again later')
}))
```

Here, we are free to define **different** handlers for different error cases specified by selector ```(error) => error.status```. In **handleHTTPErrors** we pass the **config** that will route handlers. **Config keys** have to match with possible values selected by **selector**

### Special Handlers

Sometimes, we need to define special handlers that will work by special rules. This library provides some special **config keys** to define such handlers:

#### `defaultHandler`

The `defaultHandler` is used to catch any errors that do not match with any other handler:

```typescript
import { defaultHandler } from '@oleksii-pavlov/error-handling'

createUserAPIRequest(userData).catch(handleHTTPErrors({
  400: () => console.log('Bad request'),
  500: () => console.log('Oops, server error, try again later'),
  [defaultHandler]: () => console.log('Unexpected error')
}))
```

For example, if server returns **401** error, the **defaultHandler** callback will be executed.

#### `alwaysHandler`

The `alwaysHandler` is executed **every** time error happened. **Several callbacks can be executed** if error matches some of the config keys:

```typescript
import { alwaysHandler } from '@oleksii-pavlov/error-handling'

createUserAPIRequest(userData).catch(handleHTTPErrors({
  400: () => console.log('Bad request'),
  500: () => console.log('Oops, server error, try again later'),
  [alwaysHandler]: () => console.log('Do general logic')
}))
```

This handler has to be used to isolate repeating logic in the same place.

### Helpers

Also, this package provides two utils to **apply handler**:

#### executeWithErrorHandler

```typescript
import { executeWithErrorHandler } from '@oleksii-pavlov/error-handling'

executeWithErrorHandler(callbackThatMayThrowErrors, handleHTTPErrors({
  // config handlers ...
}))
```

This util allows to handle errors for all functions without using Promise.catch method. The **callback** will be executed and handled in place. 

#### executeWithErrorHandler

```typescript
import { wrapWithErrorHandler } from '@oleksii-pavlov/error-handling'

const safeCallback = wrapWithErrorHandler(callbackThatMayThrowErrors, handleHTTPErrors({
  // config handlers ...
}))
```

This util creates a callback that handles its errors with given handler. This safe callback can be used every time its needed.
