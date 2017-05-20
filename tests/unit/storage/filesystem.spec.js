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

      /* Register spies and mocks */
      beforeEach(() => {
        spyOn(fs, "existsSync")
          .and.callThrough()
        spyOn(fs, "statSync")
          .and.callThrough()

        /* Mock filesystem */
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

      /* Register spies and mocks */
      beforeEach(() => {
        spyOn(path, "join")
          .and.callThrough()
        spyOn(fs, "existsSync")
          .and.callThrough()
        spyOn(fs, "statSync")
          .and.callThrough()

        /* Mock filesystem */
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
    })

    /* #fetch */
    describe("#fetch", () => {

      /* Register spies and mocks */
      beforeEach(() => {
        spyOn(path, "join")
          .and.callThrough()
        spyOn(fs, "readdirSync")
          .and.callThrough()
        spyOn(fs, "statSync")
          .and.callThrough()

        /* Mock filesystem */
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

        /* Mock require */
        requireMock("fetch/first/test.json", { data: true })
        requireMock("fetch/first/second/test.json", { data: true })
      })

      /* Test: should fetch data */
      it("should fetch data",
        fetchShouldFetchData
      )

      /* Test: should fetch nested data */
      it("should fetch nested data",
        fetchShouldFetchNestedData
      )

      /* Test: should throw on invalid data */
      it("should throw on invalid data",
        fetchShouldThrowOnInvalidData
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
  expect(fs.existsSync)
    .toHaveBeenCalledWith(directory)
}

/* Test: #constructor should throw on non-existing directory */
function constructorShouldThrowOnNonExistingDirectory() {
  const directory = "constructor/invalid"
  expect(() => {
    new FileSystem(directory)
  }).toThrow(
    new TypeError(`Invalid base: "${directory}"`))
  expect(fs.existsSync)
    .toHaveBeenCalledWith(directory)
}

/* Test: #constructor should throw on file */
function constructorShouldThrowOnFile() {
  const directory = "constructor/suite/test"
  expect(() => {
    new FileSystem(directory)
  }).toThrow(
    new TypeError(`Invalid base: "${directory}"`))
  expect(fs.existsSync)
    .toHaveBeenCalledWith(directory)
}

/* ----------------------------------------------------------------------------
 * Definitions: #valid
 * ------------------------------------------------------------------------- */

/* Test: #valid should succeed on existing directory */
function validShouldSucceedOnExistingDirectory() {
  const directory = "valid"
  const storage = new FileSystem(directory)
  expect(storage.valid("suite"))
    .toBe(true)
  expect(path.join)
    .toHaveBeenCalledWith(directory, "suite")
  expect(fs.existsSync.calls.count())
    .toEqual(2)
  expect(fs.statSync.calls.count())
    .toEqual(2)
}

/* Test: #valid should succeed on existing directory */
function validShouldFailOnNonExistingDirectory() {
  const directory = "valid"
  const storage = new FileSystem(directory)
  expect(storage.valid("invalid"))
    .toBe(false)
  expect(path.join)
    .toHaveBeenCalledWith(directory, "invalid")
  expect(fs.existsSync.calls.count())
    .toEqual(2)
  expect(fs.statSync.calls.count())
    .toEqual(1)
}

/* Test: #valid should fail on file */
function validShouldFailOnFile() {
  const directory = "valid"
  const storage = new FileSystem(directory)
  expect(storage.valid("test"))
    .toBe(false)
  expect(fs.existsSync.calls.count())
    .toEqual(2)
  expect(fs.statSync.calls.count())
    .toEqual(2)
}

/* ----------------------------------------------------------------------------
 * Definitions: #fetch
 * ------------------------------------------------------------------------- */

/* Test: #fetch should fetch data */
function fetchShouldFetchData() {
  const storage = new FileSystem("fetch")
  expect(storage.fetch("first"))
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
  expect(path.join.calls.count())
    .toEqual(6)
  expect(fs.readdirSync.calls.count())
    .toEqual(2)
  expect(fs.statSync.calls.count())
    .toEqual(4)
}

/* Test: #fetch should fetch nested data */
function fetchShouldFetchNestedData() {
  const storage = new FileSystem("fetch")
  expect(storage.fetch("first/second"))
    .toEqual({
      specs: {
        test: { data: true }
      }
    })
  expect(path.join.calls.count())
    .toEqual(2)
  expect(fs.readdirSync.calls.count())
    .toEqual(1)
  expect(fs.statSync.calls.count())
    .toEqual(2)
}

/* Test: #fetch should throw on invalid data */
function fetchShouldThrowOnInvalidData() {
  fsMock.restore()
  fsMock({
    "fetch": {
      "suite": {
        "test.json": "invalid"
      }
    }
  })
  requireMock("fetch/suite/test.json", "invalid")

  /* We need to override the filesystem mock specifically for this test, so we
     can test how it behaves when loading invalid data */
  const storage = new FileSystem("fetch")
  expect(() => {
    storage.fetch("suite")
  }).toThrow(
    new ReferenceError("Invalid contents: \"fetch/suite/test.json\""))
}
