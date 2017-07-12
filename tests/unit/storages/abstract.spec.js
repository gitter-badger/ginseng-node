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

import AbstractStorage from "~/src/storages/abstract"

/* ----------------------------------------------------------------------------
 * Classes
 * ------------------------------------------------------------------------- */

class IncompleteStorage extends AbstractStorage {}

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* storages/Abstract */
describe("storages/Abstract", () => {

  /* #constructor */
  describe("#constructor", () => {

    /* Test: should throw on direct call */
    it("should throw on direct call",
      constructorShouldThrowOnDirectCall
    )

    /* Test: should throw on incomplete implementation */
    it("should throw on incomplete implementation",
      constructorShouldThrowOnIncompleteImplementation
    )
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: #constructor
 * ------------------------------------------------------------------------- */

/* Test: #constructor should reject on storage error */
function constructorShouldThrowOnDirectCall() {
  expect(() => {
    new AbstractStorage()
  }).toThrow(
    new TypeError("Invalid call to constructor of abstract class")
  )
}

/* Test: #constructor should throw on incomplete implementation */
function constructorShouldThrowOnIncompleteImplementation() {
  expect(() => {
    new IncompleteStorage()
  }).toThrow(
    new TypeError("Invalid storage: missing implementation for 'valid'")
  )
}
