/*
 * Copyright (c) 2017 Martin Donath <martin.donath@squidfunk.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import httpMocks from "node-mocks-http"

import {
  default as factory
} from "~/src/middleware/error"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* Middleware.error */
describe("Middleware.error", () => {

  /* Test: should return connect-compatible middleware */
  it("should return connect-compatible middleware",
    defaultShouldReturnConnectCompatibleMiddleware
  )

    /* Test: should should set content type */
  it("should set content type",
    defaultShouldSetContentType
  )

  /* Test: should set HTTP status in payload */
  it("should set payload",
    defaultShouldSetPayload
  )
})

/* ----------------------------------------------------------------------------
 * Definitions: .default
 * ------------------------------------------------------------------------- */

/* Test: .default should return connect-compatible middleware */
function defaultShouldReturnConnectCompatibleMiddleware() {
  expect(factory().length)
    .toEqual(4)
}

/* Test: .default should set content type */
function defaultShouldSetContentType() {
  const err  = new Error("Invalid whatever"),
        req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and handle error */
  const handler = factory()
  handler(err, req, res, next)
  expect(res._getHeaders())
    .toEqual({ "Content-Type": "application/json" })
  expect(next)
    .not.toHaveBeenCalled()
}

/* Test: .default should set payload */
function defaultShouldSetPayload() {
  const err  = new Error("Invalid whatever"),
        req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Set bogus status code */
  res.statusCode = 299

  /* Create middleware and handle error */
  const handler = factory()
  handler(err, req, res, next)
  expect(res._isEndCalled())
    .toBe(true)
  expect(res.statusCode)
    .toEqual(299)
  expect(res._getData())
    .toEqual(JSON.stringify({
      status: 299,
      message: "Invalid whatever"
    }))
  expect(next)
    .not.toHaveBeenCalled()
}
