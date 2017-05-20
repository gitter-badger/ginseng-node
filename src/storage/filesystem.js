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
import path from "path"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

export default class FileSystem {

  /**
   * Create a FileSystem storage
   *
   * @constructor
   *
   * @property {String} base_ - Base directory
   *
   * @param {String} base - Base directory
   */
  constructor(base) {
    if (!(fs.existsSync(base) && fs.statSync(base).isDirectory()))
      throw new Error(`Invalid base: "${base}"`)

    /* Set base path */
    this.base_ = base
  }

  /**
   * Check, whether the given suite exists
   *
   * @param {String} suite - Suite name
   * @return {Boolean} Test result
   */
  valid(suite) {
    const directory = path.join(this.base_, suite)
    return fs.existsSync(directory) && fs.statSync(directory).isDirectory()
  }

  /**
   * Fetch suites and specifications from a directory and all subdirectories
   *
   * This method assumes that only data encoded in JSON is loaded. If the
   * file cannot be loaded with require, an error is thrown.
   *
   * @param {String} suite - Suite name
   *
   * @return {Object} Suites
   */
  fetch(suite) {
    const directory = path.join(this.base_, suite)
    return fs.readdirSync(directory).reduce((result, name) => {
      const file = path.join(directory, name)

      /* Load specifications from file */
      if (fs.statSync(file).isFile()) {
        const spec = path.basename(name, path.extname(name))
        try {
          result.specs = result.specs || {}
          result.specs[spec] = require(file)
        } catch (err) {
          throw new ReferenceError(`Invalid contents: "${file}"`)
        }

      /* Recurse on nested test suite */
      } else {
        result.suites = result.suites || {}
        result.suites[name] = this.fetch(path.join(suite, name))
      }
      return result
    }, {})
  }

  /**
   * Retrieve base directory
   *
   * @return {String} Base directory
   */
  get base() {
    return this.base_
  }
}
