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

import fs from "fs"
import fsMock from "mock-fs"
import requireMock from "mock-require"

import FileSystem from "~/src/storage/FileSystem"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* Storage */
describe("Storage", () => {

  /* FileSystem */
  describe("FileSystem", () => {

    /* Reset mocks */
    afterEach(() => {
      fsMock.restore()
    })

    /* #constructor */
    describe("#constructor", () => {

      /* Register mocks */
      beforeEach(() => {
        fsMock({
          "constructor": {
            "suite": {
              "test.json": "{ data: true }"
            }
          }
        })
      })

      /* Test: should set base directory */
      it("should set base directory",
        constructorShouldSetBaseDirectory
      )

      /* Test: should throw on non-existing directory */
      it("should throw on non-existing directory",
        constructorShouldThrowOnNonExistingDirectory
      )

      /* Test: should throw on file */
      it("should throw on file",
        constructorShouldThrowOnFile
      )
    })

    /* #valid */
    describe("#valid", () => {

      /* Register mocks */
      beforeEach(() => {
        fsMock({
          "valid": {
            "test": "",
            "suite": {
              "test.json": "{ data: true }"
            }
          }
        })
      })

      /* Test: should succeed on existing directory */
      it("should succeed on existing directory",
        validShouldSucceedOnExistingDirectory
      )

      /* Test: should fail on non-existing directory */
      it("should fail on non-existing directory",
        validShouldFailOnNonExistingDirectory
      )

      /* Test: should fail on file */
      it("should fail on file",
        validShouldFailOnFile
      )

      /* Test: should throw on empty suite name */
      it("should throw on empty suite name",
        validShouldThrowOnEmptySuiteName
      )

      /* Test: should throw on invalid suite name */
      it("should throw on invalid suite name",
        validShouldThrowOnInvalidSuiteName
      )
    })

    /* #fetch */
    describe("#fetch", () => {

      /* Register mocks */
      beforeEach(() => {
        fsMock({
          "fetch": {
            "first": {
              "test.json": "{ data: true }",
              "second": {
                "test.json": "{ data: true }"
              }
            }
          }
        })
        requireMock("fetch/first/test.json", { data: true })
        requireMock("fetch/first/second/test.json", { data: true })
      })

      /* Test: should return data */
      it("should return data",
        fetchShouldReturnData
      )

      /* Test: should return nested data */
      it("should return nested data",
        fetchShouldReturnNestedData
      )

      /* Test: should throw on empty suite name */
      it("should throw on empty suite name",
        fetchShouldThrowOnEmptySuiteName
      )

      /* Test: should throw on invalid suite name */
      it("should throw on invalid suite name",
        fetchShouldThrowOnInvalidSuiteName
      )

      /* Test: should throw on invalid data */
      it("should throw on invalid data",
        fetchShouldThrowOnInvalidData
      )
    })

    /* #store */
    describe("#store", () => {

      /* Register spies and mocks */
      beforeEach(() => {
        fsMock({
          "store": {}
        })
      })

      /* Test: should persist data */
      it("should persist data",
        storeShouldPersistData
      )

      /* Test: should persist nested data */
      it("should persist nested data",
        storeShouldPersistNestedData
      )

      /* Test: should throw on empty suite name */
      it("should throw on empty suite name",
        storeShouldThrowOnEmptySuiteName
      )

      /* Test: should throw on invalid suite name */
      it("should throw on invalid suite name",
        storeShouldThrowOnInvalidSuiteName
      )

      /* Test: should throw on invalid data */
      it("should throw on invalid data",
        storeShouldThrowOnInvalidData
      )
    })
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: #constructor
 * ------------------------------------------------------------------------- */

/* Test: #constructor should set base directory */
function constructorShouldSetBaseDirectory() {
  const directory = "constructor"
  const storage = new FileSystem(directory)
  expect(storage.base)
    .toEqual(directory)
}

/* Test: #constructor should throw on non-existing directory */
function constructorShouldThrowOnNonExistingDirectory() {
  const directory = "constructor/invalid"
  expect(() => {
    new FileSystem(directory)
  }).toThrow(
    new TypeError(`Invalid base: "${directory}"`))
}

/* Test: #constructor should throw on file */
function constructorShouldThrowOnFile() {
  const directory = "constructor/suite/test"
  expect(() => {
    new FileSystem(directory)
  }).toThrow(
    new TypeError(`Invalid base: "${directory}"`))
}

/* ----------------------------------------------------------------------------
 * Definitions: #valid
 * ------------------------------------------------------------------------- */

/* Test: #valid should succeed on existing directory */
function validShouldSucceedOnExistingDirectory() {
  expect(new FileSystem("valid").valid("suite"))
    .toBe(true)
}

/* Test: #valid should succeed on existing directory */
function validShouldFailOnNonExistingDirectory() {
  expect(new FileSystem("valid").valid("invalid"))
    .toBe(false)
}

/* Test: #valid should fail on file */
function validShouldFailOnFile() {
  expect(new FileSystem("valid").valid("test"))
    .toBe(false)
}

/* Test: #valid should throw on empty suite name */
function validShouldThrowOnEmptySuiteName() {
  expect(() => {
    new FileSystem("valid").valid("")
  }).toThrow(
    new TypeError("Invalid suite name: \"\""))
}

/* Test: #valid should throw on invalid suite name */
function validShouldThrowOnInvalidSuiteName() {
  expect(() => {
    new FileSystem("valid").valid(null)
  }).toThrow(
    new TypeError("Invalid suite name: \"null\""))
}

/* ----------------------------------------------------------------------------
 * Definitions: #fetch
 * ------------------------------------------------------------------------- */

/* Test: #fetch should return data */
function fetchShouldReturnData(done) {
  new FileSystem("fetch").fetch("first")
    .then(suite => {
      expect(suite)
        .toEqual({
          specs: {
            test: { data: true }
          },
          suites: {
            second: {
              specs: {
                test: { data: true }
              }
            }
          }
        })
      done()
    }, done.fail)
}

/* Test: #fetch should return nested data */
function fetchShouldReturnNestedData(done) {
  new FileSystem("fetch").fetch("first/second")
    .then(suite => {
      expect(suite)
        .toEqual({
          specs: {
            test: { data: true }
          }
        })
      done()
    }, done.fail)
}

/* Test: #fetch should throw on empty suite name */
function fetchShouldThrowOnEmptySuiteName(done) {
  new FileSystem("fetch").fetch("")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: \"\""))
      done()
    })
}

/* Test: #fetch should throw on invalid suite name */
function fetchShouldThrowOnInvalidSuiteName(done) {
  new FileSystem("fetch").fetch(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: \"null\""))
      done()
    })
}

/* Test: #fetch should throw on invalid data */
function fetchShouldThrowOnInvalidData(done) {
  fsMock.restore()
  fsMock({
    "fetch": {
      "suite": {
        "test.json": "invalid"
      }
    }
  })
  requireMock("fetch/suite/test.json", "")

  /* We need to override the filesystem mock specifically for this test, so we
     can test how it behaves when loading invalid data */
  new FileSystem("fetch").fetch("suite")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(
          new TypeError("Invalid contents: \"fetch/suite/test.json\""))
      done()
    })
}

/* ----------------------------------------------------------------------------
 * Definitions: #store
 * ------------------------------------------------------------------------- */

/* Test: #store should persist data */
function storeShouldPersistData(done) {
  new FileSystem("store").store("first", {
    specs: {
      test: { data: true }
    },
    suites: {
      second: {
        specs: {
          test: { data: true }
        }
      }
    }
  })
    .then(() => {
      expect(fs.readFileSync("store/first/test.json", "utf8"))
        .toEqual("{\"data\":true}")
      expect(fs.readFileSync("store/first/second/test.json", "utf8"))
        .toEqual("{\"data\":true}")
      done()
    }, done.fail)
}

/* Test: #store should persist data */
function storeShouldPersistNestedData(done) {
  new FileSystem("store").store("first/second", {
    specs: {
      test: { data: true }
    }
  })
    .then(() => {
      expect(fs.existsSync("store/first/test.json"))
        .toBe(false)
      expect(fs.readFileSync("store/first/second/test.json", "utf8"))
        .toEqual("{\"data\":true}")
      done()
    }, done.fail)
}

/* Test: #store should throw on empty suite name */
function storeShouldThrowOnEmptySuiteName(done) {
  new FileSystem("store").store("", {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: \"\""))
      done()
    })
}

/* Test: #store should throw on invalid suite name */
function storeShouldThrowOnInvalidSuiteName(done) {
  new FileSystem("store").store(null, {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: \"null\""))
      done()
    })
}

/* Test: #store should throw on invalid data */
function storeShouldThrowOnInvalidData(done) {
  new FileSystem("store").store("first", {
    specs: {
      test: { data: true }
    },
    suites: {
      second: {
        specs: {
          test: "invalid"
        }
      }
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(
        new TypeError("Invalid data: \"invalid\""))
      done()
    })
}
