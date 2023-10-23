import supertest from 'supertest'

/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'supertest' {
  interface Test {
    _assert(this: supertest.Test, resError: Error, res: supertest.Response, fn: any): void
  }
}

Object.defineProperties((supertest as any).Test.prototype, {
  _assert: {
    value: (supertest as any).Test.prototype.assert,
  },
  assert: {
    value: function (
      this: supertest.Test,
      resError: Error,
      res: supertest.Response,
      fn: any,
    ) {
      this._assert(resError, res, (err: Error, res: supertest.Response) => {
        if (err) {
          const originalMessage = err.message
          err.message = `${err.message}\nbody: ${JSON.stringify(res.body, null, 2)}`
          // Must update the stack trace as what supertest prints is the stacktrace
          err.stack = err.stack?.replace(originalMessage, err.message)
        }
        fn.call(this, err, res)
      })
    },
  },
})

/* eslint-enable @typescript-eslint/no-explicit-any */
