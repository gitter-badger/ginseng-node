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
import useragent from "useragent"

import factory from "~/src/middlewares/scope"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* middleware/scope */
describe("middleware/scope", () => {

  /* Register spies */
  beforeEach(() => {
    spyOn(useragent, "parse")
      .and.returnValue({
        toJSON: () => ({

          /* Agent information */
          family: "Agent",
          major: 1,
          minor: 2,
          patch: 3,

          /* Operating system information */
          os: {
            family: "Operating System",
            major: 4,
            minor: 5,
            patch: 6
          },

          /* Device information */
          device: {
            family: "Device",
            major: 7,
            minor: 8,
            patch: 9
          }
        })
      })
  })

  /* Test: should return connect-compatible middleware */
  it("should return connect-compatible middleware",
    defaultShouldReturnConnectCompatibleMiddleware
  )

  /* Test: should extract agent */
  it("should extract agent",
    defaultShouldExtractAgent
  )

  /* Test: should extract operating system */
  it("should extract operating system",
    defaultShouldExtractOperatingSystem
  )

  /* Test: should extract device */
  it("should extract device",
    defaultShouldExtractDevice
  )

  /* Test: should accept empty scope */
  it("should accept empty scope",
    defaultShouldAcceptEmptyScope
  )

  /* Test: should accept multiple scopes */
  it("should accept multiple scopes",
    defaultShouldAcceptMultipleScopes
  )

  /* Test: should throw on invalid scope */
  it("should throw on invalid scope",
    defaultShouldThrowOnInvalidScope
  )

  /* Test: should throw on invalid type */
  it("should throw on invalid type",
    defaultShouldThrowOnInvalidType
  )

  /* Test: should throw on invalid version */
  it("should throw on invalid version",
    defaultShouldThrowOnInvalidVersion
  )

  /* Test: should throw on invalid version level */
  it("should throw on invalid version level",
    defaultShouldThrowOnInvalidVersionLevel
  )
})

/* ----------------------------------------------------------------------------
 * Definitions: .default
 * ------------------------------------------------------------------------- */

/* Test: .default should return connect-compatible middleware */
function defaultShouldReturnConnectCompatibleMiddleware() {
  const middleware = factory()
  expect(middleware)
    .toEqual(jasmine.any(Function))
  expect(middleware.length)
    .toEqual(3)
}

/* Test: .default should extract agent */
function defaultShouldExtractAgent() {
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and handle error */
  const handler = factory([
    {
      type: "agent",
      version: ["patch", "minor", "major"]
    }
  ])
  handler(req, res, next)
  expect(req.scope)
    .toEqual("Agent 3.2.1")
  expect(next)
    .toHaveBeenCalled()
}

/* Test: .default should extract operating system */
function defaultShouldExtractOperatingSystem() {
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and handle error */
  const handler = factory([
    {
      type: "os",
      version: ["patch", "minor", "major"]
    }
  ])
  handler(req, res, next)
  expect(req.scope)
    .toEqual("Operating System 6.5.4")
  expect(next)
    .toHaveBeenCalled()
}

/* Test: .default should extract device */
function defaultShouldExtractDevice() {
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and handle error */
  const handler = factory([
    {
      type: "device",
      version: ["patch", "minor", "major"]
    }
  ])
  handler(req, res, next)
  expect(req.scope)
    .toEqual("Device 9.8.7")
  expect(next)
    .toHaveBeenCalled()
}

/* Test: .default should accept empty scope */
function defaultShouldAcceptEmptyScope() {
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and handle error */
  const handler = factory()
  handler(req, res, next)
  expect(req.scope)
    .toEqual("")
  expect(next)
    .toHaveBeenCalled()
}

/* Test: .default should accept multiple scopes */
function defaultShouldAcceptMultipleScopes() {
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and handle error */
  const handler = factory([
    {
      type: "agent",
      version: ["patch", "minor", "major"]
    },
    {
      type: "os",
      version: ["minor", "major"]
    },
    {
      type: "device",
      version: ["major"]
    }
  ])
  handler(req, res, next)
  expect(req.scope)
    .toEqual("Agent 3.2.1/Operating System 5.4/Device 7")
  expect(next)
    .toHaveBeenCalled()
}

/* Test: .default should throw on invalid scope */
function defaultShouldThrowOnInvalidScope() {
  expect(() => {
    factory("invalid")
  }).toThrow(
    new TypeError("Invalid scope: 'invalid'"))
}

/* Test: .default should throw on invalid type */
function defaultShouldThrowOnInvalidType() {
  expect(() => {
    factory([{
      type: "invalid"
    }])
  }).toThrow(
    new TypeError("Invalid type: 'invalid'"))
}

/* Test: .default should throw on invalid version */
function defaultShouldThrowOnInvalidVersion() {
  expect(() => {
    factory([{
      type: "agent",
      version: "invalid"
    }])
  }).toThrow(
    new TypeError("Invalid version: 'invalid'"))
}

/* Test: .default should throw on invalid version level */
function defaultShouldThrowOnInvalidVersionLevel() {
  expect(() => {
    factory([{
      type: "agent",
      version: ["invalid"]
    }])
  }).toThrow(
    new TypeError("Invalid version level: 'invalid'"))
}
