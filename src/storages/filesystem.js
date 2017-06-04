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
import json from "jsonfile"
import merge from "deepmerge"
import mkdirp from "mkdirp-promise"
import path from "path"
import { inspect } from "util"

/* ----------------------------------------------------------------------------
 * Variables
 * ------------------------------------------------------------------------- */

/**
 * Name specification for test suites and specifications
 *
 * This test is necessary, as the file system storage takes the path/name of
 * the suite, splits it at slashes and writes the specifications and nested
 * suites to disk. While Linux and macOS allow all ASCII characters inside
 * file names except null and /, Windows does not support /:*?"<>|.
 *
 * @type {RegExp} Regular expression matching valid file names
 */
const spec = new RegExp(
  "^" +
    "[ !#$%&'()+,.0-9;=@A-Z\\[\\]^_a-z{}~-]+" +
    "(\/" +
      "[ !#$%&'()+,.0-9;=@A-Z\\[\\]^_a-z{}~-]+" +
    ")*" +
  "$")

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Validate suite name character range
 *
 * @param {string} suite - Suite name
 *
 * @return {Boolean} Test result
 */
export const inrange = suite => spec.test(suite)

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

export default class FileSystem {

  /**
   * Create a file system storage
   *
   * @constructor
   *
   * @property {string} base_ - Base directory
   *
   * @param {string} base - Base directory
   */
  constructor(base, options = {}) {
    if (typeof base !== "string" || !base.length)
      throw new TypeError(`Invalid base: ${inspect(base)}`)
    if (typeof options !== "object")
      throw new TypeError(`Invalid options: ${inspect(options)}`)
    if (options.strict && typeof options.strict !== "boolean")
      throw new TypeError(
        `Invalid strict option: ${inspect(options.strict)}`)

    /* Merge options with defaults */
    this.options_ = {
      ...{ strict: true },
      ...options
    }

    /* Check base directory exists */
    if (!(fs.existsSync(base) && fs.statSync(base).isDirectory()))
      throw new Error(`Invalid base: ${inspect(base)}`)

    /* Set base path */
    this.base_ = base
  }

  /**
   * Check, whether the given suite exists
   *
   * @param {string} suite - Suite name
   *
   * @return {Boolean} Test result
   */
  valid(suite) {
    if (typeof suite !== "string" || !inrange(suite))
      throw new TypeError(`Invalid suite name: ${inspect(suite)}`)

    /* Check for existing directory */
    const directory = path.join(this.base_, suite)
    return fs.existsSync(directory) && fs.statSync(directory).isDirectory()
  }

  /**
   * Fetch suites and specifications from a directory and all subdirectories
   *
   * @param {string} suite - Suite name
   *
   * @return {Promise<Object>} Promise resolving with fetched data
   */
  fetch(suite) {
    return new Promise((resolve, reject) => {
      if (typeof suite !== "string" || !inrange(suite))
        return reject(new TypeError(`Invalid suite name: ${inspect(suite)}`))

      /* Traverse directory */
      const directory = path.join(this.base_, suite)
      fs.readdir(directory, (readErr, files) => {
        if (readErr)
          return reject(readErr)

        /* Load files asynchronously and recurse */
        Promise.all(files.map(name => {
          return new Promise((resolveFile, rejectFile) => {
            const file = path.join(directory, name)
            fs.stat(file, (statErr, stats) => {
              if (statErr)
                return rejectFile(statErr)

              /* Load specifications from file */
              if (stats.isFile()) {
                const spec = path.basename(name, path.extname(name))
                json.readFile(file, (err, data) => {
                  if (err)
                    return this.options_.strict
                      ? rejectFile(err)
                      : resolveFile(null)

                  /* JSON was loaded successfully */
                  resolveFile({ specs: { [spec]: data } })
                })

              /* Recurse on nested test suite */
              } else {
                this.fetch(path.join(suite, name))

                  /* Return nested test suites */
                  .then(suites =>
                    resolveFile({ suites: { [name]: suites } }))

                  /* Propagate error */
                  .catch(rejectFile)
              }
            })
          })
        }))

          /* Merge nested test suites and specifications - two empty objects
             are appended, because in non-strict mode the filtered array can
             be empty and merge.all demands at least two input elements */
          .then(data =>
            resolve(merge.all([...data.filter(Boolean), {}, {}])))

          /* Propagate error */
          .catch(reject)
      })
    })
  }

  /**
   * [fetchAll description]
   * @return {[type]} [description]
   */
  fetchAll() {
    return new Promise((resolve, reject) => {

      /* Traverse directory */
      fs.readdir(this.base_, (readErr, files) => {
        if (readErr)
          return reject(readErr)

        /* Load suites asynchronously */
        Promise.all(files.map(file => {
          return new Promise((resolveFile, rejectFile) => {
            fs.stat(path.join(this.base_, file), (statErr, stats) => {
              if (statErr)
                return rejectFile(statErr)

              /* Filter non-directories */
              if (!stats.isDirectory())
                return this.options_.strict
                  ? rejectFile(
                      new TypeError(`Invalid contents: ${inspect(file)}`))
                  : resolveFile(null)

              /* On error, resolve in non-strict case, otherwise reject */
              this.fetch(file)
                .then(resolveFile)
                .catch(err =>
                  this.options_.strict
                    ? rejectFile(err)
                    : resolveFile(null))
            })
          })
        }))

          /* Filter load errors */
          .then(data =>
            resolve(data.filter(Boolean)))

          /* Propagate error */
          .catch(reject)
      })
    })
  }

  /**
   * Store specifications and subsuites for a suite
   *
   * @param {string} suite - Suite name
   * @param {Object} data - Specifications and nested test suites               // TODO: document/validate data format
   *
   * @return {Promise<undefined>} Promise resolving with no result
   */
  store(suite, data) {
    return new Promise((resolve, reject) => {
      if (typeof suite !== "string" || !inrange(suite))
        return reject(new TypeError(`Invalid suite name: ${inspect(suite)}`))
      if (typeof data !== "object")
        return reject(new TypeError(`Invalid data: ${inspect(data)}`))
      resolve()
    })

      /* Ensure directory is present */
      .then(() => mkdirp(path.join(this.base_, suite)))

      /* Write files asynchronously */
      .then(() => {
        const directory = path.join(this.base_, suite)
        return Promise.all([

          /* Write specifications */
          ...Object.keys(data.specs || {}).map(name => {
            return new Promise((resolveSpec, rejectSpec) => {
              if (typeof data.specs[name] !== "object")
                return rejectSpec(new TypeError(
                  `Invalid contents: ${inspect(data.specs[name])}`))

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
            return this.store(path.join(suite, name), data.suites[name])
          })
        ])
      })
  }

  /**
   * Create a scoped file system sub storage
   *
   * @param {...string} parts - Scope parts
   *
   * @return {Promise<FileSystem>} Promise resolving with file system storage
   */
  scope(...parts) {
    if (parts.find(part => typeof part !== "string" || !inrange(part)) ||
        parts.length === 0)
      throw new TypeError(`Invalid scope: ${inspect(parts)}`)

    /* Ensure scoped base is present and return sub storage */
    const base = path.join(this.base_, ...parts)
    return mkdirp(base)
      .then(() => new FileSystem(base))
  }

  /**
   * Retrieve base directory
   *
   * @return {string} Base directory
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
 * @param {string} base - Base directory
 *
 * @return {Promise<FileSystem>} Promise resolving with file system storage
 */
export const factory = base => {
  return mkdirp(base)
    .then(() => new FileSystem(base))
}
