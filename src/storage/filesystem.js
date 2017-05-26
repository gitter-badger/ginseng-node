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
import merge from "deepmerge"
import mkdirp from "mkdirp-promise"
import path from "path"

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

export default class FileSystem {

  /**
   * Create a file system storage
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
   * @param {Array<String>} [scope=[]] - Scope for handling multiple agents
   *
   * @return {Boolean} Test result
   */
  valid(suite, scope = []) {
    if (typeof suite !== "string" || !suite.length)
      throw new TypeError(`Invalid suite name: "${suite}"`)
    if (!(scope instanceof Array))
      throw new TypeError(`Invalid scope: "${scope}"`)

    /* Check for existing directory */
    const directory = path.join(this.base_, ...scope, suite)
    return fs.existsSync(directory) && fs.statSync(directory).isDirectory()
  }

  /**
   * Fetch suites and specifications from a directory and all subdirectories
   *
   * This method assumes that all data that is loaded is encoded in JSON. If
   * the file cannot be loaded with require, an error is thrown.
   *
   * @param {String} suite - Suite name
   * @param {Array<String>} [scope=[]] - Scope for handling multiple agents
   *
   * @return {Promise<Object>} Promise resolving with fetched data
   */
  fetch(suite, scope = []) {
    return new Promise((resolve, reject) => {
      if (typeof suite !== "string" || !suite.length)
        return reject(new TypeError(`Invalid suite name: "${suite}"`))
      if (!(scope instanceof Array))
        return reject(new TypeError(`Invalid scope: "${scope}"`))

      /* Traverse directory */
      const directory = path.join(this.base_, ...scope, suite)
      fs.readdir(directory, (readErr, files) => {
        if (readErr)
          return reject(readErr)

        /* Load files asynchronously and recurse */
        return Promise.all(files.map(name => {
          return new Promise((resolveFile, rejectFile) => {
            const file = path.join(directory, name)
            fs.stat(file, (statErr, stats) => {
              if (statErr)
                return rejectFile(statErr)

              /* Load specifications from file */
              if (stats.isFile()) {
                const spec = path.basename(name, path.extname(name))
                try {
                  return resolveFile({ specs: { [spec]: require(file) } })
                } catch (_) {
                  return rejectFile(
                    new TypeError(`Invalid contents: "${file}"`))
                }

              /* Recurse on nested test suite */
              } else {
                this.fetch(path.join(suite, name), scope)

                  /* Return nested test suites */
                  .then(suites =>
                    resolveFile({ suites: { [name]: suites } }))

                  /* Propagate error */
                  .catch(fetchErr =>
                    rejectFile(fetchErr))
              }
            })
          })
        }))

          /* Merge nested test suites and specifications */
          .then(data =>
            resolve(merge.all([...data, {}])))

          /* Propagate error */
          .catch(allErr =>
            reject(allErr))
      })
    })
  }

  /**
   * Store specifications and subsuites for a suite
   *
   * @param {String} suite - Suite name
   * @param {Object} data - Specifications and nested test suites               // TODO: document/validate data format
   * @param {Array<String>} [scope=[]] - Scope for handling multiple agents
   *
   * @return {Promise} Promise resolving with no result
   */
  store(suite, data, scope = []) {
    return new Promise((resolve, reject) => {
      if (typeof suite !== "string" || !suite.length)
        return reject(new TypeError(`Invalid suite name: "${suite}"`))
      if (typeof data !== "object")
        return reject(new TypeError(`Invalid data: "${data}"`))
      if (!(scope instanceof Array))
        return reject(new TypeError(`Invalid scope: "${scope}"`))
      resolve()
    })

      /* Ensure directory is present */
      .then(() => mkdirp(path.join(this.base_, ...scope, suite)))

      /* Write files asynchronously */
      .then(() => {
        const directory = path.join(this.base_, ...scope, suite)
        return Promise.all([

          /* Write specifications */
          ...Object.keys(data.specs || {}).map(name => {
            return new Promise((resolveSpec, rejectSpec) => {
              if (typeof data.specs[name] !== "object")
                return rejectSpec(
                  new TypeError(`Invalid contents: "${data.specs[name]}"`))

              /* Serialize data and write to file */
              const file = path.join(directory, `${name}.json`)
              fs.writeFile(file, JSON.stringify(data.specs[name]), writeErr => {
                if (writeErr)
                  return rejectSpec(writeErr)
                resolveSpec()
              })
            })
          }),

          /* Write nested test suites */
          ...Object.keys(data.suites || {}).map(name => {
            return this.store(path.join(suite, name), data.suites[name], scope)
          })
        ])
      })
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

/* ----------------------------------------------------------------------------
 * Factory
 * ------------------------------------------------------------------------- */

/**
 * Create a file system storage and ensure that the base directory is present
 *
 * @param {String} base - Base directory
 *
 * @return {Promise<FileSystem>} Promise resolving with file system storage
 */
export const factory = base => {
  return mkdirp(base)
    .then(() => new FileSystem(base))
}
