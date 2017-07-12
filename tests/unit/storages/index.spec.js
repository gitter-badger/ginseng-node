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

import path from "path"
import requireMock from "mock-require"

import factory from "~/src/storages"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* storages */
describe("storages", () => {
  pending("Storage tests must be reworked due to changed implementation")

  /* Register spies and mocks */
  beforeEach(() => {
    requireMock(path.resolve("src/storages/resolve"), {
      factory: jasmine.createSpy("factory")
        .and.callFake(() => Promise.resolve("succeed"))
    })
    requireMock(path.resolve("src/storages/reject"), {
      factory: jasmine.createSpy("factory")
        .and.callFake(() => Promise.reject("fail"))
    })
    requireMock(path.resolve("src/storages/error"), {
      factory: jasmine.createSpy("factory")
        .and.callFake(() => {
          throw new Error
        })
    })
  })

  /* Test: should return promise */
  it("should return promise",
    defaultShouldReturnPromise
  )

  /* Test: should prepend directory if relative */
  it("should prepend directory if relative",
    defaultShouldPrependDirectoryIfRelative
  )

  /* Test: should not prepend directory if absolute */
  it("should not prepend directory if absolute",
    defaultShouldNotPrependDirectoryIfAbsolute
  )

  /* Test: should resolve with storage */
  it("should resolve with storage",
    defaultShouldResolveWithStorage
  )

  /* Test: should reject on empty storavge type */
  it("should reject on empty storage type",
    defaultShouldRejectOnEmptyStorageType
  )

  /* Test: should reject on invalid storage type */
  it("should reject on invalid storage type",
    defaultShouldRejectOnInvalidStorageType
  )

  /* Test: should reject on non-existing storage */
  it("should reject on non-existing storage",
    defaultShouldRejectOnNonExistingStorage
  )

  /* Test: should reject on storage error */
  it("should reject on storage error",
    defaultShouldRejectOnStorageError
  )
})

/* ----------------------------------------------------------------------------
 * Definitions: .default
 * ------------------------------------------------------------------------- */

/* Test: .default should return promise */
function defaultShouldReturnPromise(done) {
  expect(factory()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: .default should prepend directory if relative */
function defaultShouldPrependDirectoryIfRelative(done) {
  factory("fail/relative")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new Error(
          `Cannot find module '${path.resolve("src/storages/fail/relative")}'`
        ))
      done()
    })
}

/* Test: .default should not prepend directory if absolute */
function defaultShouldNotPrependDirectoryIfAbsolute(done) {
  factory("/fail/absolute")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new Error(
          `Cannot find module '${path.resolve("/fail/absolute")}'`
        ))
      done()
    })
}

/* Test: .default should resolve with storage */
function defaultShouldResolveWithStorage(done) {
  factory("resolve")
    .then(storage => {
      expect(storage)
        .toEqual("succeed")
      done()
    })
    .catch(done.fail)
}

/* Test: .default should reject on empty storage type */
function defaultShouldRejectOnEmptyStorageType(done) {
  factory("")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid type: ''"))
      done()
    })
}

/* Test: .default should reject on invalid storage type */
function defaultShouldRejectOnInvalidStorageType(done) {
  factory(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid type: null"))
      done()
    })
}

/* Test: .default should reject on non-existing storage */
function defaultShouldRejectOnNonExistingStorage(done) {
  factory("reject")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual("fail")
      done()
    })
}

/* Test: .default should reject on storage error */
function defaultShouldRejectOnStorageError(done) {
  factory("error")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(Error))
      done()
    })
}
