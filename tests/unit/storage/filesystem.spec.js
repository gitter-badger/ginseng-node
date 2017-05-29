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
import path from "path"
import requireMock from "mock-require"

import {
  PATTERN,
  factory,
  default as FileSystem
} from "~/src/storage/filesystem"

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

    /* @PATTERN */
    describe("@PATTERN", () => {

      /* Test: should succeed on suite name */
      it("should succeed on suite name",
        patternShouldSucceedOnSuiteName
      )

      /* Test: should succeed on nested suite name */
      it("should succeed on nested suite name",
        patternShouldSuceedOnNestedSuiteName
      )

      /* Test: should fail on empty suite name */
      it("should fail on empty suite name",
        patternShouldFailOnEmptySuiteName
      )

      /* Test: should fail on empty nested suite name */
      it("should fail on empty nested suite name",
        patternShouldFailOnEmptyNestedSuiteName
      )

      /* Test: should fail on reserved characters */
      it("should fail on reserved characters",
        patternShouldFailOnReservedCharacters
      )
    })

    /* #constructor */
    describe("#constructor", () => {

      /* Register spies and mocks */
      beforeEach(() => {

        /* Mock filesystem */
        fsMock({
          "constructor": {
            "genmaicha": {
              "oolong.json": "{ data: true }"
            }
          }
        })
      })

      /* Test: should set base directory */
      it("should set base directory",
        constructorShouldSetBaseDirectory
      )

      /* Test: should throw on non-existing base directory */
      it("should throw on non-existing base directory",
        constructorShouldThrowOnNonExistingBaseDirectory
      )

      /* Test: should throw on file */
      it("should throw on file",
        constructorShouldThrowOnFile
      )
    })

    /* #valid */
    describe("#valid", () => {

      /* Register spies and mocks */
      beforeEach(() => {
        spyOn(path, "join")
          .and.callThrough()

        /* Mock filesystem */
        fsMock({
          "valid": {
            "sencha": "",
            "genmaicha": {
              "oolong.json": ""
            }
          }
        })
      })

      /* Test: should succeed on existing suite */
      it("should succeed on existing suite",
        validShouldSucceedOnExistingSuite
      )

      /* Test: should fail on non-existing suite */
      it("should fail on non-existing suite",
        validShouldFailOnNonExistingSuite
      )

      /* Test: should fail on file */
      it("should fail on file",
        validShouldFailOnFile
      )

      /* Test: should respect scope */
      it("should respect scope",
        validShouldRespectScope
      )

      /* Test: should throw on empty suite name */
      it("should throw on empty suite name",
        validShouldThrowOnEmptySuiteName
      )

      /* Test: should throw on invalid suite name */
      it("should throw on invalid suite name",
        validShouldThrowOnInvalidSuiteName
      )

      /* Test: should throw on invalid scope */
      it("should throw on invalid scope",
        validShouldThrowOnInvalidScope
      )
    })

    /* #fetch */
    describe("#fetch", () => {

      /* Register spies and mocks */
      beforeEach(() => {
        spyOn(path, "join")
          .and.callThrough()

        /* Mock filesystem */
        fsMock({
          "fetch": {
            "genmaicha": {
              "oolong.json": "",
              "sencha": {
                "bancha.json": ""
              }
            },
            "scope": {
              "genmaicha": {
                "oolong.json": ""
              }
            }
          }
        })

        /* Mock required files */
        requireMock("fetch/genmaicha/oolong.json", { data: true })
        requireMock("fetch/genmaicha/sencha/bancha.json", { data: true })
      })

      /* Test: should return data */
      it("should return data",
        fetchShouldReturnData
      )

      /* Test: should return nested data */                                     // TODO: should send agents correctly (path.join!)
      it("should return nested data",
        fetchShouldReturnNestedData
      )

      /* Test: should respect scope */
      it("should respect scope",
        fetchShouldRespectScope
      )

      /* Test: should throw on empty suite name */
      it("should throw on empty suite name",
        fetchShouldThrowOnEmptySuiteName
      )

      /* Test: should throw on invalid suite name */
      it("should throw on invalid suite name",
        fetchShouldThrowOnInvalidSuiteName
      )

      /* Test: should throw on invalid scope */
      it("should throw on invalid scope",
        fetchShouldThrowOnInvalidScope
      )

      /* Test: should throw on invalid contents */
      it("should throw on invalid contents",
        fetchShouldThrowOnInvalidContents
      )

      /* Test: should throw on nested invalid contents */
      it("should throw on nested invalid contents",
        fetchShouldThrowOnNestedInvalidContents
      )

      /* Test: should throw on non-existing suite */
      it("should throw on non-existing suite",
        fetchShouldThrowOnNonExistingSuite
      )

      /* Test: should throw on failed stat */
      it("should throw on failed stat",
        fetchShouldThrowOnFailedStat
      )
    })

    /* #store */
    describe("#store", () => {

      /* Register spies and mocks */
      beforeEach(() => {
        spyOn(path, "join")
          .and.callThrough()

        /* Mock filesystem */
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

      /* Test: should respect scope */
      it("should respect scope",
        storeShouldRespectScope
      )

      /* Test: should throw on empty suite name */
      it("should throw on empty suite name",
        storeShouldThrowOnEmptySuiteName
      )

      /* Test: should throw on invalid suite name */
      it("should throw on invalid suite name",
        storeShouldThrowOnInvalidSuiteName
      )

      /* Test: should throw on invalid scope */
      it("should throw on invalid scope",
        storeShouldThrowOnInvalidScope
      )

      /* Test: should throw on invalid data */
      it("should throw on invalid data",
        storeShouldThrowOnInvalidData
      )

      /* Test: should throw on invalid contents */
      it("should throw on invalid contents",
        storeShouldThrowOnInvalidContents
      )

      /* Test: should throw on failed write */
      it("should throw on failed write",
        storeShouldThrowOnFailedWrite
      )
    })

    /* .factory */
    describe(".factory", () => {

      /* Register mocks */
      beforeEach(() => {
        fsMock({
          "factory": {}
        })
      })

      /* Test: should use existing base directory */
      it("should use existing base directory",
        factoryShouldUseExistingBaseDirectory
      )

      /* Test: should create non-existing base directory */
      it("should create non-existing base directory",
        factoryShouldCreateNonExistingBaseDirectory
      )

      /* Test: should throw on constructor error */
      it("should throw on constructor error",
        factoryShouldThrowOnConstructorError
      )
    })
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: @PATTERN
 * ------------------------------------------------------------------------- */

/* Test: @PATTERN should succeed on suite name */
function patternShouldSucceedOnSuiteName() {
  expect("genmaicha")
    .toMatch(PATTERN)
}

/* Test: @PATTERN should succeed on nested suite name */
function patternShouldSuceedOnNestedSuiteName() {
  expect("genmaicha/oolong")
    .toMatch(PATTERN)
}

/* Test: @PATTERN should fail on empty suite name */
function patternShouldFailOnEmptySuiteName() {
  expect("")
    .not.toMatch(PATTERN)
}

/* Test: @PATTERN should fail on empty nested suite name */
function patternShouldFailOnEmptyNestedSuiteName() {
  expect("genmaicha/")
    .not.toMatch(PATTERN)
}

/* Test: @PATTERN should fail on reserved characters */
function patternShouldFailOnReservedCharacters() {
  ":*?\"<>|".split("").forEach(char =>
    expect(char)
      .not.toMatch(PATTERN))
}

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

/* Test: #constructor should throw on non-existing base directory */
function constructorShouldThrowOnNonExistingBaseDirectory() {
  const directory = "constructor/invalid"
  expect(() => {
    new FileSystem(directory)
  }).toThrow(
    new TypeError(`Invalid base: '${directory}'`))
}

/* Test: #constructor should throw on file */
function constructorShouldThrowOnFile() {
  const directory = "constructor/genmaicha/oolong"
  expect(() => {
    new FileSystem(directory)
  }).toThrow(
    new TypeError(`Invalid base: '${directory}'`))
}

/* ----------------------------------------------------------------------------
 * Definitions: #valid
 * ------------------------------------------------------------------------- */

/* Test: #valid should succeed on existing suite */
function validShouldSucceedOnExistingSuite() {
  expect(new FileSystem("valid").valid("genmaicha"))
    .toBe(true)
}

/* Test: #valid should succeed on existing suite */
function validShouldFailOnNonExistingSuite() {
  expect(new FileSystem("valid").valid("invalid"))
    .toBe(false)
}

/* Test: #valid should fail on file */
function validShouldFailOnFile() {
  expect(new FileSystem("valid").valid("sencha"))
    .toBe(false)
}

/* Test: #valid should respect scope */
function validShouldRespectScope() {
  const scope = ["agent", "os"]
  new FileSystem("valid").valid("genmaicha", scope)
  expect(path.join)
    .toHaveBeenCalledWith("valid", ...scope, "genmaicha")
}

/* Test: #valid should throw on empty suite name */
function validShouldThrowOnEmptySuiteName() {
  spyOn(String.prototype, "match")
  expect(() => {
    new FileSystem("valid").valid("")
  }).toThrow(
    new TypeError("Invalid suite name: ''"))
  expect(String.prototype.match)
    .toHaveBeenCalledWith(PATTERN)
}

/* Test: #valid should throw on invalid suite name */
function validShouldThrowOnInvalidSuiteName() {
  spyOn(String.prototype, "match")
  expect(() => {
    new FileSystem("valid").valid(null)
  }).toThrow(
    new TypeError("Invalid suite name: null"))
  expect(String.prototype.match)
    .not.toHaveBeenCalledWith(PATTERN)
}

/* Test: #valid should throw on invalid scope */
function validShouldThrowOnInvalidScope() {
  expect(() => {
    new FileSystem("valid").valid("oolong", null)
  }).toThrow(
    new TypeError("Invalid scope: null"))
}

/* ----------------------------------------------------------------------------
 * Definitions: #fetch
 * ------------------------------------------------------------------------- */

/* Test: #fetch should return data */
function fetchShouldReturnData(done) {
  new FileSystem("fetch").fetch("genmaicha")
    .then(suite => {
      expect(suite)
        .toEqual({
          specs: {
            oolong: { data: true }
          },
          suites: {
            sencha: {
              specs: {
                bancha: { data: true }
              }
            }
          }
        })
      done()
    })
    .catch(done.fail)
}

/* Test: #fetch should return nested data */
function fetchShouldReturnNestedData(done) {
  new FileSystem("fetch").fetch("genmaicha/sencha")
    .then(suite => {
      expect(suite)
        .toEqual({
          specs: {
            bancha: { data: true }
          }
        })
      done()
    })
    .catch(done.fail)
}

/* Test: #fetch should respect scope */
function fetchShouldRespectScope(done) {
  const scope = ["agent", "os"]
  new FileSystem("fetch").fetch("hojicha", scope)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(Error))
      expect(path.join)
        .toHaveBeenCalledWith("fetch", ...scope, "hojicha")
      done()
    })
}

/* Test: #fetch should throw on empty suite name */
function fetchShouldThrowOnEmptySuiteName(done) {
  spyOn(String.prototype, "match")
  new FileSystem("fetch").fetch("")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: ''"))
      expect(String.prototype.match)
        .toHaveBeenCalledWith(PATTERN)
      done()
    })
}

/* Test: #fetch should throw on invalid suite name */
function fetchShouldThrowOnInvalidSuiteName(done) {
  spyOn(String.prototype, "match")
  new FileSystem("fetch").fetch(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: null"))
      expect(String.prototype.match)
        .not.toHaveBeenCalledWith(PATTERN)
      done()
    })
}

/* Test: #fetch should throw on invalid scope */
function fetchShouldThrowOnInvalidScope(done) {
  new FileSystem("fetch").fetch("matcha", null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid scope: null"))
      done()
    })
}

/* Test: #fetch should throw on invalid contents */
function fetchShouldThrowOnInvalidContents(done) {
  requireMock("fetch/genmaicha/oolong.json", "")
  new FileSystem("fetch").fetch("genmaicha")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(
          new TypeError("Invalid contents: 'fetch/genmaicha/oolong.json'"))
      done()
    })
}

/* Test: #fetch should throw on nested invalid contents */
function fetchShouldThrowOnNestedInvalidContents(done) {
  requireMock("fetch/genmaicha/sencha/bancha.json", "")
  new FileSystem("fetch").fetch("genmaicha")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(
          new TypeError(
            "Invalid contents: 'fetch/genmaicha/sencha/bancha.json'"))
      done()
    })
}

/* Test: #fetch should throw on non-existing suite */
function fetchShouldThrowOnNonExistingSuite(done) {
  new FileSystem("fetch").fetch("invalid")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(Error))
      done()
    })
}

/* Test: #fetch should throw on failed stat */
function fetchShouldThrowOnFailedStat(done) {
  spyOn(fs, "stat")
    .and.callFake((file, cb) => {
      cb("fail")
    })
  new FileSystem("fetch").fetch("genmaicha")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual("fail")
      done()
    })
}

/* ----------------------------------------------------------------------------
 * Definitions: #store
 * ------------------------------------------------------------------------- */

/* Test: #store should persist data */
function storeShouldPersistData(done) {
  new FileSystem("store").store("genmaicha", {
    specs: {
      oolong: { data: true }
    },
    suites: {
      sencha: {
        specs: {
          bancha: { data: true }
        }
      }
    }
  })
    .then(() => {
      expect(fs.readFileSync("store/genmaicha/oolong.json", "utf8"))
        .toEqual("{\"data\":true}")
      expect(fs.readFileSync("store/genmaicha/sencha/bancha.json", "utf8"))
        .toEqual("{\"data\":true}")
      done()
    })
    .catch(done.fail)
}

/* Test: #store should persist data */
function storeShouldPersistNestedData(done) {
  new FileSystem("store").store("genmaicha/sencha", {
    specs: {
      bancha: { data: true }
    }
  })
    .then(() => {
      expect(fs.readFileSync("store/genmaicha/sencha/bancha.json", "utf8"))
        .toEqual("{\"data\":true}")
      done()
    })
    .catch(done.fail)
}

/* Test: #store should respect scope */
function storeShouldRespectScope(done) {
  const scope = ["agent", "os"]
  new FileSystem("store").store("hojicha", {}, scope)
    .then(() => {
      expect(path.join)
        .toHaveBeenCalledWith("store", ...scope, "hojicha")
      done()
    })
    .catch(done.fail)
}

/* Test: #store should throw on empty suite name */
function storeShouldThrowOnEmptySuiteName(done) {
  spyOn(String.prototype, "match")
  new FileSystem("store").store("", {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: ''"))
      expect(String.prototype.match)
        .toHaveBeenCalledWith(PATTERN)
      done()
    })
}

/* Test: #store should throw on invalid suite name */
function storeShouldThrowOnInvalidSuiteName(done) {
  spyOn(String.prototype, "match")
  new FileSystem("store").store(null, {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: null"))
      expect(String.prototype.match)
        .not.toHaveBeenCalledWith(PATTERN)
      done()
    })
}

/* Test: #store should throw on invalid scope */
function storeShouldThrowOnInvalidScope(done) {
  new FileSystem("store").store("matcha", {}, null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid scope: null"))
      done()
    })
}

/* Test: #store should throw on invalid data */
function storeShouldThrowOnInvalidData(done) {
  new FileSystem("store").store("shincha", "invalid")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid data: 'invalid'"))
      done()
    })
}

/* Test: #store should throw on invalid contents */
function storeShouldThrowOnInvalidContents(done) {
  new FileSystem("store").store("genmaicha", {
    specs: {
      oolong: { data: true }
    },
    suites: {
      sencha: {
        specs: {
          bancha: "invalid"
        }
      }
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(
        new TypeError("Invalid contents: 'invalid'"))
      done()
    })
}

/* Test: #fetch should throw on failed write */
function storeShouldThrowOnFailedWrite(done) {
  spyOn(fs, "writeFile")
    .and.callFake((file, data, cb) => {
      cb("fail")
    })
  new FileSystem("store").store("genmaicha", {
    specs: {
      oolong: { data: true }
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual("fail")
      done()
    })
}

/* ----------------------------------------------------------------------------
 * Definitions: .factory
 * ------------------------------------------------------------------------- */

/* Test: .factory should use existing base directory */
function factoryShouldUseExistingBaseDirectory(done) {
  factory("factory")
    .then(storage => {
      expect(storage.base)
        .toEqual("factory")
      expect(fs.existsSync("factory"))
        .toBe(true)
      done()
    })
    .catch(done.fail)
}

/* Test: .factory should create non-existing base directory */
function factoryShouldCreateNonExistingBaseDirectory(done) {
  factory("genmaicha/sencha/bancha")
    .then(storage => {
      expect(storage.base)
        .toEqual("genmaicha/sencha/bancha")
      expect(fs.existsSync("genmaicha/sencha/bancha"))
        .toBe(true)
      done()
    })
    .catch(done.fail)
}

/* Test: .factory should throw on constructor error */
function factoryShouldThrowOnConstructorError(done) {
  factory(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(TypeError))
      done()
    })
}
