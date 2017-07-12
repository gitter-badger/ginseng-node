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

import {
  filter,
  names
} from "~/src/util/data"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* util */
describe("util", () => {

  /* Setup fixtures */
  beforeEach(function() {
    this.data = {
      suites: {
        genmaicha: {
          suites: {
            oolong: {
              suites: {
                shincha: {
                  specs: { data: true }
                }
              }
            }
          }
        },
        sencha: {
          suites: {
            oolong: {
              suites: {
                shincha: {
                  specs: { data: true }
                }
              }
            },
            matcha: {
              suites: {
                hojicha: {
                  specs: { data: true }
                }
              }
            }
          }
        }
      }
    }
  })

  /* .filter */
  describe(".filter", () => {

    /* Test: should include suite matching pattern */
    it("should include suite matching pattern",
      filterShouldIncludeSuiteMatchingPattern
    )

    /* Test: should include suite matching pattern ignoring case */
    it("should include suite matching pattern ignoring case",
      filterShouldIncludeSuiteMatchingPatternIgnoringCase
    )

    /* Test: should include suite starting with pattern */
    it("should include suite starting with pattern",
      filterShouldIncludeSuiteStartingWithPattern
    )

    /* Test: should include suite ending with pattern */
    it("should include suite ending with pattern",
      filterShouldIncludeSuiteEndingWithPattern
    )

    /* Test: should include suite on nested suite matching pattern */
    it("should include suite on nested suite matching pattern",
      filterShouldIncludeSuiteOnNestedSuiteMatchingPattern
    )

    /* Test: should include suite on nested suite starting with pattern */
    it("should include suite on nested suite starting with pattern",
      filterShouldIncludeSuiteOnNestedSuiteStartingWithPattern
    )

    /* Test: should include suite on nested suite ending with pattern */
    it("should include suite on nested suite ending with pattern",
      filterShouldIncludeSuiteOnNestedSuiteEndingWithPattern
    )

    /* Test: should include skipped level on suite matching pattern */
    it("should include skipped level on suite matching pattern",
      filterShouldIncludeSkippedLevelOnSuiteMatchingPattern
    )
  })

  /* .names */
  describe(".names", () => {

    /* Test: should return names for suites with specs */
    it("should return names for suites with specs",
      namesShouldReturnNamesForSuitesWithSpecs
    )
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: .filter
 * ------------------------------------------------------------------------- */

/* Test: .filter should include suite matching pattern */
function filterShouldIncludeSuiteMatchingPattern() {
  const data = filter(this.data, { pattern: "genmaicha" })
  expect(Object.keys(data.suites).length)
    .toEqual(1)
  expect(data.suites.genmaicha)
    .toEqual(this.data.suites.genmaicha)
}

/* Test: .filter should include suite matching pattern ignoring case */
function filterShouldIncludeSuiteMatchingPatternIgnoringCase() {
  const data = filter(this.data, { pattern: "GENMAICHA" })
  expect(Object.keys(data.suites).length)
    .toEqual(1)
  expect(data.suites.genmaicha)
    .toEqual(this.data.suites.genmaicha)
}

/* Test: .filter should include suite starting with pattern */
function filterShouldIncludeSuiteStartingWithPattern() {
  const data = filter(this.data, { pattern: "*cha" })
  expect(data)
    .toEqual(this.data)
}

/* Test: .filter should include suite ending with pattern */
function filterShouldIncludeSuiteEndingWithPattern() {
  const data = filter(this.data, { pattern: "gen*" })
  expect(Object.keys(data.suites).length)
    .toEqual(1)
  expect(data.suites.genmaicha)
    .toEqual(this.data.suites.genmaicha)
}

/* Test: .filter should include suite on nested suite matching pattern */
function filterShouldIncludeSuiteOnNestedSuiteMatchingPattern() {
  const data = filter(this.data, { pattern: "*/matcha" })
  expect(Object.keys(data.suites).length)
    .toEqual(1)
  expect(data.suites.sencha.suites.oolong)
    .toBeUndefined()
  expect(data.suites.sencha.suites.matcha)
    .toEqual(this.data.suites.sencha.suites.matcha)
}

/* Test: .filter should include suite on nested suite starting with pattern */
function filterShouldIncludeSuiteOnNestedSuiteStartingWithPattern() {
  const data = filter(this.data, { pattern: "*/oo*" })
  expect(Object.keys(data.suites).length)
    .toEqual(2)
  expect(data.suites.genmaicha)
    .toEqual(this.data.suites.genmaicha)
  expect(data.suites.genmaicha.suites.oolong)
    .toEqual(this.data.suites.genmaicha.suites.oolong)
  expect(data.suites.sencha.suites.oolong)
    .toEqual(this.data.suites.sencha.suites.oolong)
  expect(data.suites.sencha.suites.matcha)
    .toBeUndefined()
}

/* Test: .filter should include suite on nested suite starting with pattern */
function filterShouldIncludeSuiteOnNestedSuiteEndingWithPattern() {
  const data = filter(this.data, { pattern: "*/*long" })
  expect(Object.keys(data.suites).length)
    .toEqual(2)
  expect(data.suites.genmaicha)
    .toEqual(this.data.suites.genmaicha)
  expect(data.suites.genmaicha.suites.oolong)
    .toEqual(this.data.suites.genmaicha.suites.oolong)
  expect(data.suites.sencha.suites.oolong)
    .toEqual(this.data.suites.sencha.suites.oolong)
  expect(data.suites.sencha.suites.matcha)
    .toBeUndefined()
}

/* Test: .filter should include skipped level on suite matching pattern */
function filterShouldIncludeSkippedLevelOnSuiteMatchingPattern() {
  const data = filter(this.data, { pattern: "oo*", skip: 1 })
  expect(Object.keys(data.suites).length)
    .toEqual(2)
  expect(data.suites.genmaicha)
    .toEqual(this.data.suites.genmaicha)
  expect(data.suites.genmaicha.suites.oolong)
    .toEqual(this.data.suites.genmaicha.suites.oolong)
  expect(data.suites.sencha.suites.oolong)
    .toEqual(this.data.suites.sencha.suites.oolong)
  expect(data.suites.sencha.suites.matcha)
    .toBeUndefined()
}

/* ----------------------------------------------------------------------------
 * Definitions: .names
 * ------------------------------------------------------------------------- */

/* Test: .names should return names for suites with specs */
function namesShouldReturnNamesForSuitesWithSpecs() {
  expect(names(this.data))
    .toEqual([
      "genmaicha/oolong/shincha",
      "sencha/oolong/shincha",
      "sencha/matcha/hojicha"
    ])
}
