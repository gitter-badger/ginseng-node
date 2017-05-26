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

import Router from "router"

import * as middleware from "~/src/middleware/storage"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* Middleware */
describe("Middleware", () => {

  /* storage */
  describe("storage", () => {

    /* Test: should return router */
    it("should return router",
      defaultShouldReturnRouter
    )

    /* Test: should return default router */
    it("should return default router",
      defaultShouldReturnDefaultRouter
    )

    /* Test: should register HTTP GET handler */
    it("should register HTTP GET handler",
      defaultShouldRegisterHttpGetHandler
    )

    /* Test: should register HTTP POST handler */
    it("should register HTTP POST handler",
      defaultShouldRegisterHttpPostHandler
    )

    /* Test: should throw on invalid initializer */
    it("should throw on invalid initializer",
      defaultShouldThrowOnInvalidInitializer
    )

    /* Test: should throw on invalid router */
    it("should throw on invalid router",
      defaultShouldThrowOnInvalidRouter
    )

    /* .get */
    describe(".get", () => {

      /* Register spies */
      beforeEach(() => {
        spyOn(useragent, "parse")
          .and.returnValue({
            toAgent: () => "agent",
            os: {
              toString: () => "os"
            }
          })
      })

      /* Test: should return connect-compatible middleware */
      it("should return connect-compatible middleware",
        getShouldReturnConnectCompatibleMiddleware
      )

      /* Test: should set content type on success */
      it("should set content type on success",
        getShouldSetContentTypeOnSuccess
      )

      /* Test: should not set content type on error */
      it("should not set content type on error",
        getShouldNotSetContentTypeOnError
      )

      /* Test: should set HTTP status to 200 on success */
      it("should set HTTP status to 200 on success",
        getShouldSetHttpStatusTo200OnSuccess
      )

      /* Test: should set HTTP status to 404 on non-existing directory */
      it("should set HTTP status to 404 on non-existing directory",
        getShouldSetHttpStatusTo404OnNonExistingDirectory
      )

      /* Test: should set HTTP status to 500 on internal error */
      it("should set HTTP status to 500 on internal error",
        getShouldSetHttpStatusTo500OnInternalError
      )

      /* Test: should throw on invalid initializer */
      it("should throw on invalid initializer",
        getShouldThrowOnInvalidInitializer
      )
    })

    /* .post */
    describe(".post", () => {

      /* Register spies */
      beforeEach(() => {
        spyOn(useragent, "parse")
          .and.returnValue({
            toAgent: () => "agent",
            os: {
              toString: () => "os"
            }
          })
      })

      /* Test: should return connect-compatible middleware */
      it("should return connect-compatible middleware",
        postShouldReturnConnectCompatibleMiddleware
      )

      /* Test: should set HTTP status to 200 on success */
      it("should set HTTP status to 200 on success",
        postShouldSetHttpStatusTo200OnSuccess
      )

      /* Test: should set HTTP status to 500 on internal error */
      it("should set HTTP status to 500 on internal error",
        postShouldSetHttpStatusTo500OnInternalError
      )

      /* Test: should throw on invalid initializer */
      it("should throw on invalid initializer",
        postShouldThrowOnInvalidInitializer
      )
    })
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: .default
 * ------------------------------------------------------------------------- */

/* Test: .default should return router */
function defaultShouldReturnRouter() {
  const router = new Router()
  expect(middleware.default(Promise.resolve(), router))
    .toEqual(router)
}

/* Test: .default should return default router */
function defaultShouldReturnDefaultRouter() {
  expect(middleware.default(Promise.resolve()))
    .toEqual(jasmine.any(Router))
}

/* Test: .default should register HTTP GET handler */
function defaultShouldRegisterHttpGetHandler() {
  const router = new Router()
  spyOn(router, "get")
  middleware.default(Promise.resolve(), router)
  expect(router.get)
    .toHaveBeenCalledWith("/:path(\\S*)?", jasmine.any(Function))
}

/* Test: .default should register HTTP POST handler */
function defaultShouldRegisterHttpPostHandler() {
  const router = new Router()
  spyOn(router, "post")
  middleware.default(Promise.resolve(), router)
  expect(router.post)
    .toHaveBeenCalledWith("/:path(\\S*)?", jasmine.any(Function))
}

/* Test: .default should throw on invalid initializer */
function defaultShouldThrowOnInvalidInitializer() {
  expect(() => {
    middleware.default(null)
  }).toThrow(
    new TypeError("Invalid initializer: \"null\""))
}

/* Test: .default should throw on invalid router */
function defaultShouldThrowOnInvalidRouter() {
  expect(() => {
    middleware.default(Promise.resolve(), "invalid")
  }).toThrow(
    new TypeError("Invalid router: \"invalid\""))
}

/* ----------------------------------------------------------------------------
 * Definitions: .get
 * ------------------------------------------------------------------------- */

/* Test: .get should return connect-compatible middleware */
function getShouldReturnConnectCompatibleMiddleware() {
  expect(middleware.get(Promise.resolve()).length)
    .toEqual(3)
}

/* Test: .get should set content type on success */
function getShouldSetContentTypeOnSuccess(done) {
  const storage = {
    valid: jasmine.createSpy("valid").and.returnValue(true),
    fetch: jasmine.createSpy("fetch").and.returnValue(
      Promise.resolve({ data: true }))
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.get(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._getHeaders())
        .toEqual({ "Content-Type": "application/json" })
      done()
    })
    .catch(done.fail)
}

/* Test: .get should not set content type on error */
function getShouldNotSetContentTypeOnError(done) {
  const storage = {
    valid: jasmine.createSpy("valid").and.returnValue(false)
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest({ params: { path: "invalid" } }),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.get(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._getHeaders())
        .toEqual({})
      done()
    })
    .catch(done.fail)
}

/* Test: .get should set HTTP status to 200 on success */
function getShouldSetHttpStatusTo200OnSuccess(done) {
  const storage = {
    valid: jasmine.createSpy("valid").and.returnValue(true),
    fetch: jasmine.createSpy("fetch").and.returnValue(
      Promise.resolve({ data: true }))
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.get(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._isEndCalled())
        .toBe(true)
      expect(res.statusCode)
        .toEqual(200)
      expect(res._getData())
        .toEqual(JSON.stringify({ data: true }))
      expect(next)
        .not.toHaveBeenCalled()
      done()
    })
    .catch(done.fail)
}

/* Test: .get should set HTTP status to 404 on non-existing directory */
function getShouldSetHttpStatusTo404OnNonExistingDirectory(done) {
  const storage = {
    valid: jasmine.createSpy("valid").and.returnValue(false)
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest({ params: { path: "invalid" } }),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.get(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._isEndCalled())
        .toBe(false)
      expect(res.statusCode)
        .toEqual(404)
      expect(next)
        .toHaveBeenCalledWith(
          new ReferenceError("Invalid path: invalid not found for agent, os"))
      done()
    })
    .catch(done.fail)
}

/* Test: .get should set HTTP status to 500 on internal error */
function getShouldSetHttpStatusTo500OnInternalError(done) {
  const storage = {
    valid: jasmine.createSpy("valid").and.returnValue(true),
    fetch: jasmine.createSpy("fetch").and.returnValue(
      Promise.reject(new Error("Internal error")))
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.get(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._isEndCalled())
        .toBe(false)
      expect(res.statusCode)
        .toEqual(500)
      expect(next)
        .toHaveBeenCalledWith(
          new ReferenceError("Internal error"))
      done()
    })
    .catch(done.fail)
}

/* Test: .get should throw on invalid initializer */
function getShouldThrowOnInvalidInitializer() {
  expect(() => {
    middleware.get(null)
  }).toThrow(
    new TypeError("Invalid initializer: \"null\""))
}

/* ----------------------------------------------------------------------------
 * Definitions: .post
 * ------------------------------------------------------------------------- */

/* Test: .post should return connect-compatible middleware */
function postShouldReturnConnectCompatibleMiddleware() {
  expect(middleware.post(Promise.resolve()).length)
    .toEqual(3)
}

/* Test: .post should set HTTP status to 200 on success */
function postShouldSetHttpStatusTo200OnSuccess(done) {
  const storage = {
    store: jasmine.createSpy("store").and.returnValue(Promise.resolve())
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.post(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._isEndCalled())
        .toBe(true)
      expect(res.statusCode)
        .toEqual(201)
      expect(res._getData())
        .toEqual("")
      expect(next)
        .not.toHaveBeenCalled()
      done()
    })
    .catch(done.fail)
}

/* Test: .post should set HTTP status to 500 on internal error */
function postShouldSetHttpStatusTo500OnInternalError(done) {
  const storage = {
    store: jasmine.createSpy("store").and.returnValue(
      Promise.reject(new Error("Internal error")))
  }

  /* Mock middleware parameters */
  const req  = httpMocks.createRequest(),
        res  = httpMocks.createResponse(),
        next = jasmine.createSpy("next")

  /* Create middleware and resolve request */
  const handler = middleware.post(Promise.resolve(storage))
  handler(req, res, next)
    .then(() => {
      expect(res._isEndCalled())
        .toBe(false)
      expect(res.statusCode)
        .toEqual(500)
      expect(next)
        .toHaveBeenCalledWith(
          new ReferenceError("Internal error"))
      done()
    })
    .catch(done.fail)
}

/* Test: .post should throw on invalid initializer */
function postShouldThrowOnInvalidInitializer() {
  expect(() => {
    middleware.post(null)
  }).toThrow(
    new TypeError("Invalid initializer: \"null\""))
}
