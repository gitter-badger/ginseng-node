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
import json from "jsonfile"
import path from "path"

import {
  inrange,
  default as FileSystemStorage
} from "~/src/storages/filesystem"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* storages/FileSystem */
describe("storages/FileSystem", () => {

  /* Reset mocks */
  afterEach(() => {
    fsMock.restore()
  })

  /* .inrange */
  describe(".inrange", () => {

    /* Test: should succeed on suite name */
    it("should succeed on suite name",
      inrangeShouldSucceedOnSuiteName
    )

    /* Test: should succeed on nested suite name */
    it("should succeed on nested suite name",
      inrangeShouldSuceedOnNestedSuiteName
    )

    /* Test: should fail on empty suite name */
    it("should fail on empty suite name",
      inrangeShouldFailOnEmptySuiteName
    )

    /* Test: should fail on empty nested suite name */
    it("should fail on empty nested suite name",
      inrangeShouldFailOnEmptyNestedSuiteName
    )

    /* Test: should fail on reserved characters */
    it("should fail on reserved characters",
      inrangeShouldFailOnReservedCharacters
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

    /* Test: should return promise */
    it("should return promise",
      factoryShouldReturnPromise
    )

    /* Test: should use existing base directory */
    it("should use existing base directory",
      factoryShouldUseExistingBaseDirectory
    )

    /* Test: should create non-existing base directory */
    it("should create non-existing base directory",
      factoryShouldCreateNonExistingBaseDirectory
    )

    /* Test: should reject on constructor error */
    it("should reject on constructor error",
      factoryShouldRejectOnConstructorError
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
            "oolong.json": ""
          }
        }
      })
    })

    /* Test: should set base directory */
    it("should set base directory",
      constructorShouldSetBaseDirectory
    )

    /* Test: should throw on empty base directory */
    it("should throw on empty base directory",
      constructorShouldThrowOnEmptyBaseDirectory
    )

    /* Test: should throw on invalid base directory */
    it("should throw on invalid base directory",
      constructorShouldThrowOnInvalidBaseDirectory
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

    /* Register spies and mocks */
    beforeEach(() => {

      /* Mock filesystem */
      fsMock({
        "fetch": {
          "genmaicha": {
            "oolong.json": "{ \"data\": true }",
            "sencha": {
              "bancha.json": "{ \"data\": true }",
              "invalid": "ignored-anyway"
            }
          },
          "matcha": {
            "hojicha.json": "invalid"
          },
          "tencha": {}
        }
      })
    })

    /* Test: should return promise */
    it("should return promise",
      fetchShouldReturnPromise
    )

    /* Test: should resolve with data */
    it("should resolve with data",
      fetchShouldResolveWithData
    )

    /* Test: should resolve with nested data */
    it("should resolve with nested data",
      fetchShouldResolveWithNestedData
    )

    /* Test: should resolve with empty data */
    it("should resolve with empty data",
      fetchShouldResolveWithEmptyData
    )

    /* Test: should reject on empty suite name */
    it("should reject on empty suite name",
      fetchShouldRejectOnEmptySuiteName
    )

    /* Test: should reject on invalid suite name */
    it("should reject on invalid suite name",
      fetchShouldRejectOnInvalidSuiteName
    )

    /* Test: should reject on invalid specification */
    it("should reject on invalid specification",
      fetchShouldRejectOnInvalidSpecification
    )

    /* Test: should reject on non-existing suite */
    it("should reject on non-existing suite",
      fetchShouldRejectOnNonExistingSuite
    )

    /* Test: should reject on failed stat */
    it("should reject on failed stat",
      fetchShouldRejectOnFailedStat
    )
  })

  /* #store */
  describe("#store", () => {

    /* Register spies and mocks */
    beforeEach(() => {

      /* Mock filesystem */
      fsMock({
        "store": {}
      })
    })

    /* Test: should return promise */
    it("should return promise",
      storeShouldReturnPromise
    )

    /* Test: should persist data */
    it("should persist data",
      storeShouldPersistData
    )

    /* Test: should persist nested data */
    it("should persist nested data",
      storeShouldPersistNestedData
    )

    /* Test: should persist nested suites */
    it("should persist nested suites",
      storeShouldPersistNestedSuites
    )

    /* Test: should reject on empty suite name */
    it("should reject on empty suite name",
      storeShouldRejectOnEmptySuiteName
    )

    /* Test: should reject on invalid suite name */
    it("should reject on invalid suite name",
      storeShouldRejectOnInvalidSuiteName
    )

    /* Test: should reject on invalid data */
    it("should reject on invalid data",
      storeShouldRejectOnInvalidData
    )

    /* Test: should reject on invalid specification */
    it("should reject on invalid specification",
      storeShouldRejectOnInvalidSpecification
    )

    /* Test: should reject on invalid nested specification */
    it("should reject on invalid nested specification",
      storeShouldRejectOnInvalidNestedSpecification
    )

    /* Test: should reject on invalid suite */
    it("should reject on invalid suite",
      storeShouldRejectOnInvalidSuite
    )

    /* Test: should reject on invalid nested suite */
    it("should reject on invalid nested suite",
      storeShouldRejectOnInvalidNestedSuite
    )

    /* Test: should reject on failed write */
    it("should reject on failed write",
      storeShouldRejectOnFailedWrite
    )
  })

  /* #export */
  describe("#export", () => {

    /* Register spies and mocks */
    beforeEach(() => {

      /* Mock filesystem */
      fsMock({
        "export": {
          "genmaicha": {
            "oolong.json": "{ \"data\": true }",
            "sencha": {
              "bancha.json": "{ \"data\": true }",
              "invalid": "ignored-anyway"
            }
          },
          "matcha": {
            "hojicha.json": "{ \"data\": true }"
          },
          "tencha": {}
        }
      })
    })

    /* Test: should return promise */
    it("should return promise",
      exportShouldReturnPromise
    )

    /* Test: should ignore files */
    it("should ignore files",
      exportShouldIgnoreFiles
    )

    /* Test: should resolve with data */
    it("should resolve with data",
      exportShouldResolveWithData
    )

    /* Test: should reject on failed stat */
    it("should reject on failed stat",
      exportShouldRejectOnFailedStat
    )
  })

  /* #import */
  describe("#import", () => {

    /* Register spies and mocks */
    beforeEach(() => {

      /* Mock filesystem */
      fsMock({
        "import": {}
      })
    })

    /* Test: should return promise */
    it("should return promise",
      importShouldReturnPromise
    )

    /* Test: should persist data */
    it("should persist data",
      importShouldPersistData
    )

    /* Test: should reject on failed write */
    it("should reject on failed write",
      importShouldRejectOnFailedWrite
    )
  })

  /* #scope */
  describe("#scope", () => {

    /* Register spies and mocks */
    beforeEach(() => {
      spyOn(path, "join")
        .and.callThrough()

      /* Mock filesystem */
      fsMock({
        "scope": {
          "agent": {
            "os": {}
          }
        }
      })
    })

    /* Test: should return promise */
    it("should return promise",
      scopeShouldReturnPromise
    )

    /* Test: should return scoped file system */
    it("should return scoped file system",
      scopeShouldReturnScopedFileSystem
    )

    /* Test: should throw on empty suite name */
    it("should throw on empty suite name",
      scopeShouldThrowOnEmptySuiteName
    )

    /* Test: should throw on invalid suite name */
    it("should throw on invalid suite name",
      scopeShouldThrowOnInvalidSuiteName
    )
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: .inrange
 * ------------------------------------------------------------------------- */

/* Test: .inrange should succeed on suite name */
function inrangeShouldSucceedOnSuiteName() {
  expect(inrange("genmaicha"))
    .toBe(true)
}

/* Test: .inrange should succeed on nested suite name */
function inrangeShouldSuceedOnNestedSuiteName() {
  expect(inrange("genmaicha/oolong"))
    .toBe(true)
}

/* Test: .inrange should fail on empty suite name */
function inrangeShouldFailOnEmptySuiteName() {
  expect(inrange(""))
    .toBe(false)
}

/* Test: .inrange should fail on empty nested suite name */
function inrangeShouldFailOnEmptyNestedSuiteName() {
  expect(inrange("genmaicha/"))
    .toBe(false)
}

/* Test: .inrange should fail on reserved characters */
function inrangeShouldFailOnReservedCharacters() {
  ":*?\"<>|".split("").forEach(char =>
    expect(inrange(char))
      .toBe(false))
}

/* ----------------------------------------------------------------------------
 * Definitions: .factory
 * ------------------------------------------------------------------------- */

/* Test: .factory should return promise */
function factoryShouldReturnPromise(done) {
  expect(FileSystemStorage.factory()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: .factory should use existing base directory */
function factoryShouldUseExistingBaseDirectory(done) {
  FileSystemStorage.factory("factory")
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
  FileSystemStorage.factory("genmaicha/sencha/bancha")
    .then(storage => {
      expect(storage.base)
        .toEqual("genmaicha/sencha/bancha")
      expect(fs.existsSync("genmaicha/sencha/bancha"))
        .toBe(true)
      done()
    })
    .catch(done.fail)
}

/* Test: .factory should reject on constructor error */
function factoryShouldRejectOnConstructorError(done) {
  FileSystemStorage.factory(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(TypeError))
      done()
    })
}

/* ----------------------------------------------------------------------------
 * Definitions: #constructor
 * ------------------------------------------------------------------------- */

/* Test: #constructor should set base directory */
function constructorShouldSetBaseDirectory() {
  const directory = "constructor"
  const storage = new FileSystemStorage(directory)
  expect(storage.base)
    .toEqual(directory)
}

/* Test: #constructor should throw on empty base directory */
function constructorShouldThrowOnEmptyBaseDirectory() {
  expect(() => {
    new FileSystemStorage("")
  }).toThrow(
    new TypeError("Invalid base: ''"))
}

/* Test: #constructor should throw on invalid base directory */
function constructorShouldThrowOnInvalidBaseDirectory() {
  expect(() => {
    new FileSystemStorage(null)
  }).toThrow(
    new TypeError("Invalid base: null"))
}

/* Test: #constructor should throw on non-existing base directory */
function constructorShouldThrowOnNonExistingBaseDirectory() {
  const directory = "constructor/invalid"
  expect(() => {
    new FileSystemStorage(directory)
  }).toThrow(
    new TypeError(`Invalid base: '${directory}'`))
}

/* Test: #constructor should throw on file */
function constructorShouldThrowOnFile() {
  const directory = "constructor/genmaicha/oolong"
  expect(() => {
    new FileSystemStorage(directory)
  }).toThrow(
    new TypeError(`Invalid base: '${directory}'`))
}

/* ----------------------------------------------------------------------------
 * Definitions: #valid
 * ------------------------------------------------------------------------- */

/* Test: #valid should succeed on existing suite */
function validShouldSucceedOnExistingSuite() {
  expect(new FileSystemStorage("valid").valid("genmaicha"))
    .toBe(true)
}

/* Test: #valid should succeed on existing suite */
function validShouldFailOnNonExistingSuite() {
  expect(new FileSystemStorage("valid").valid("invalid"))
    .toBe(false)
}

/* Test: #valid should fail on file */
function validShouldFailOnFile() {
  expect(new FileSystemStorage("valid").valid("sencha"))
    .toBe(false)
}

/* Test: #valid should throw on empty suite name */
function validShouldThrowOnEmptySuiteName() {
  expect(() => {
    new FileSystemStorage("valid").valid("")
  }).toThrow(
    new TypeError("Invalid suite name: ''"))
}

/* Test: #valid should throw on invalid suite name */
function validShouldThrowOnInvalidSuiteName() {
  expect(() => {
    new FileSystemStorage("valid").valid(null)
  }).toThrow(
    new TypeError("Invalid suite name: null"))
}

/* ----------------------------------------------------------------------------
 * Definitions: #fetch
 * ------------------------------------------------------------------------- */

/* Test: #fetch should return promise */
function fetchShouldReturnPromise(done) {
  expect(new FileSystemStorage("fetch").fetch()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #fetch should resolve with data */
function fetchShouldResolveWithData(done) {
  new FileSystemStorage("fetch").fetch("genmaicha")
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

/* Test: #fetch should resolve with nested data */
function fetchShouldResolveWithNestedData(done) {
  new FileSystemStorage("fetch").fetch("genmaicha/sencha")
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

/* Test: #fetch should resolve with empty data */
function fetchShouldResolveWithEmptyData(done) {
  new FileSystemStorage("fetch").fetch("tencha")
    .then(suite => {
      expect(suite)
        .toEqual({})
      done()
    })
    .catch(done.fail)
}

/* Test: #fetch should reject on empty suite name */
function fetchShouldRejectOnEmptySuiteName(done) {
  new FileSystemStorage("fetch").fetch("")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: ''"))
      done()
    })
}

/* Test: #fetch should reject on invalid suite name */
function fetchShouldRejectOnInvalidSuiteName(done) {
  new FileSystemStorage("fetch").fetch(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: null"))
      done()
    })
}

/* Test: #fetch should reject on invalid specification */
function fetchShouldRejectOnInvalidSpecification(done) {
  new FileSystemStorage("fetch").fetch("matcha")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(Error))
      done()
    })
}

/* Test: #fetch should reject on non-existing suite */
function fetchShouldRejectOnNonExistingSuite(done) {
  new FileSystemStorage("fetch").fetch("invalid")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(jasmine.any(Error))
      done()
    })
}

/* Test: #fetch should reject on failed stat */
function fetchShouldRejectOnFailedStat(done) {
  spyOn(fs, "stat")
    .and.callFake((file, cb) => {
      cb("fail")
    })
  new FileSystemStorage("fetch").fetch("genmaicha")
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

/* Test: #store should return promise */
function storeShouldReturnPromise(done) {
  expect(new FileSystemStorage("store").store()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #store should persist data */
function storeShouldPersistData(done) {
  new FileSystemStorage("store").store("genmaicha", {
    specs: {
      oolong: { data: true }
    }
  })
    .then(() => {
      expect(fs.readFileSync("store/genmaicha/oolong.json", "utf8"))
        .toEqual("{\n  \"data\": true\n}\n")
      done()
    })
    .catch(done.fail)
}

/* Test: #store should persist data */
function storeShouldPersistNestedData(done) {
  new FileSystemStorage("store").store("genmaicha/sencha", {
    specs: {
      bancha: { data: true }
    }
  })
    .then(() => {
      expect(fs.readFileSync("store/genmaicha/sencha/bancha.json", "utf8"))
        .toEqual("{\n  \"data\": true\n}\n")
      done()
    })
    .catch(done.fail)
}

/* Test: #store should persist nested suites */
function storeShouldPersistNestedSuites(done) {
  new FileSystemStorage("store").store("genmaicha", {
    suites: {
      sencha: {
        specs: {
          bancha: { data: true }
        }
      }
    }
  })
    .then(() => {
      expect(fs.readFileSync("store/genmaicha/sencha/bancha.json", "utf8"))
        .toEqual("{\n  \"data\": true\n}\n")
      done()
    })
    .catch(done.fail)
}

/* Test: #store should Reject on empty suite name */
function storeShouldRejectOnEmptySuiteName(done) {
  new FileSystemStorage("store").store("", {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: ''"))
      done()
    })
}

/* Test: #store should reject on invalid suite name */
function storeShouldRejectOnInvalidSuiteName(done) {
  new FileSystemStorage("store").store(null, {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: null"))
      done()
    })
}

/* Test: #store should reject on invalid data */
function storeShouldRejectOnInvalidData(done) {
  new FileSystemStorage("store").store("shincha", "invalid")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid data: 'invalid'"))
      done()
    })
}

/* Test: #store should reject on invalid specification */
function storeShouldRejectOnInvalidSpecification(done) {
  new FileSystemStorage("store").store("genmaicha", {
    specs: {
      oolong: "invalid"
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid specification: 'invalid'"))
      done()
    })
}

/* Test: #store should reject on invalid nested specification */
function storeShouldRejectOnInvalidNestedSpecification(done) {
  new FileSystemStorage("store").store("genmaicha", {
    suites: {
      oolong: {
        specs: {
          sencha: "invalid"
        }
      }
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid specification: 'invalid'"))
      done()
    })
}

/* Test: #store should reject on invalid suite */
function storeShouldRejectOnInvalidSuite(done) {
  new FileSystemStorage("store").store("genmaicha", {
    suites: {
      oolong: "invalid"
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite: 'invalid'"))
      done()
    })
}

/* Test: #store should reject on invalid nested suite */
function storeShouldRejectOnInvalidNestedSuite(done) {
  new FileSystemStorage("store").store("genmaicha", {
    suites: {
      oolong: {
        suites: {
          sencha: "invalid"
        }
      }
    }
  })
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite: 'invalid'"))
      done()
    })
}

/* Test: #store should reject on failed write */
function storeShouldRejectOnFailedWrite(done) {
  spyOn(json, "writeFile")
    // eslint-disable-next-line max-params
    .and.callFake((file, data, options, cb) => {
      cb("fail")
    })
  new FileSystemStorage("store").store("genmaicha", {
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
 * Definitions: #export
 * ------------------------------------------------------------------------- */

/* Test: #export should return promise */
function exportShouldReturnPromise(done) {
  expect(new FileSystemStorage("export").export()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #export should ignore files */
function exportShouldIgnoreFiles(done) {
  fsMock({
    "export": {
      "genmaicha": {
        "oolong.json": "{ \"data\": true }"
      },
      "invalid": "ignored-anyway"
    }
  })
  new FileSystemStorage("export").export()
    .then(suite => {
      expect(suite)
        .toEqual({
          suites: {
            genmaicha: {
              specs: {
                oolong: { data: true }
              }
            }
          }
        })
      done()
    })
    .catch(done.fail)
}

/* Test: #export should resolve with data */
function exportShouldResolveWithData(done) {
  new FileSystemStorage("export").export()
    .then(suite => {
      expect(suite)
        .toEqual({
          suites: {
            genmaicha: {
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
            },
            matcha: {
              specs: {
                hojicha: { data: true }
              }
            },
            tencha: {}
          }
        })
      done()
    })
    .catch(done.fail)
}

/* Test: #export should reject on failed stat */
function exportShouldRejectOnFailedStat(done) {
  spyOn(fs, "stat")
    .and.callFake((file, cb) => {
      cb("fail")
    })
  new FileSystemStorage("export").export()
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual("fail")
      done()
    })
}

/* ----------------------------------------------------------------------------
 * Definitions: #import
 * ------------------------------------------------------------------------- */

/* Test: #import should return promise */
function importShouldReturnPromise(done) {
  expect(new FileSystemStorage("import").import()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #import should persist data */
function importShouldPersistData(done) {
  new FileSystemStorage("import").import({
    suites: {
      genmaicha: {
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
      },
      matcha: {
        specs: {
          hojicha: { data: true }
        }
      }
    }
  })
    .then(() => {
      expect(fs.readFileSync("import/genmaicha/oolong.json", "utf8"))
        .toEqual("{\n  \"data\": true\n}\n")
      expect(fs.readFileSync("import/genmaicha/sencha/bancha.json", "utf8"))
        .toEqual("{\n  \"data\": true\n}\n")
      expect(fs.readFileSync("import/matcha/hojicha.json", "utf8"))
        .toEqual("{\n  \"data\": true\n}\n")
      done()
    })
    .catch(done.fail)
}

/* Test: #import should reject on failed write */
function importShouldRejectOnFailedWrite(done) {
  spyOn(json, "writeFile")
    // eslint-disable-next-line max-params
    .and.callFake((file, data, options, cb) => {
      cb("fail")
    })
  new FileSystemStorage("import").import({
    suites: {
      genmaicha: {
        specs: {
          oolong: { data: true }
        }
      }
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
 * Definitions: #scope
 * ------------------------------------------------------------------------- */

/* Test: #scope should return promise */
function scopeShouldReturnPromise(done) {
  expect(new FileSystemStorage("scope").scope("agent/os")
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #scope should return scoped file system */
function scopeShouldReturnScopedFileSystem(done) {
  new FileSystemStorage("scope").scope("agent/os")
    .then(storage => {
      expect(storage.base)
        .toEqual("scope/agent/os")
      expect(path.join)
        .toHaveBeenCalledWith("scope", "agent/os")
      done()
    })
    .catch(done.fail)
}

/* Test: #scope should throw on empty suite name */
function scopeShouldThrowOnEmptySuiteName() {
  expect(() => {
    new FileSystemStorage("scope").scope("")
  }).toThrow(
    new TypeError("Invalid suite name: ''"))
}

/* Test: #scope should throw on invalid suite name */
function scopeShouldThrowOnInvalidSuiteName() {
  expect(() => {
    new FileSystemStorage("scope").scope(null)
  }).toThrow(
    new TypeError("Invalid suite name: null"))
}
