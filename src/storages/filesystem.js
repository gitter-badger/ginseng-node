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

import AbstractStorage from "./abstract"

/* ----------------------------------------------------------------------------
 * Variables
 * ------------------------------------------------------------------------- */

/**
 * Character range for valid suite names
 *
 * This test is necessary, as the file system storage takes the path/name of
 * the suite, splits it at slashes and writes the specifications and nested
 * suites to disk. While Linux and macOS allow all ASCII characters inside
 * file names except null and /, Windows does not support /:*?"<>|.
 *
 * @type {RegExp} Regular expression matching valid file names
 */
const FILE_SYSTEM_CHARACTER_RANGE = new RegExp(
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
 * Check suite name character range
 *
 * @param {string} suite - Suite name
 *
 * @return {Boolean} Test result
 */
export const inrange = suite => FILE_SYSTEM_CHARACTER_RANGE.test(suite)

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

export default class FileSystemStorage extends AbstractStorage {

  /**
   * Create a file system storage
   *
   * The file system storage provides an easy way to fetch and store test data
   * for different clients which are implemented with scopes. Correct scoping
   * during access is the duty of the caller, so the implied standards must
   * always be followed, or the file system storage may return garbage.
   *
   * @constructor
   *
   * @property {string} base_ - Base directory
   *
   * @param {string} base - Base directory
   */
  constructor(base) {
    if (typeof base !== "string" || !inrange(base))
      throw new TypeError(`Invalid base: ${inspect(base)}`)

    /* Check for base directory */
    if (!(fs.existsSync(base) && fs.statSync(base).isDirectory()))
      throw new Error(`Invalid base: ${inspect(base)}`)

    /* Call base constructor */
    super()

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
                if (path.extname(name) !== ".json")
                  return resolveFile({})

                /* Load contents */
                const spec = path.basename(name, path.extname(name))
                json.readFile(file, (err, data) => {
                  return err
                    ? rejectFile(err)
                    : resolveFile({ specs: { [spec]: data } })
                })

              /* Recurse on nested suite */
              } else {
                this.fetch(path.join(suite, name))

                  /* Return nested suites */
                  .then(suites =>
                    resolveFile({ suites: { [name]: suites } }))

                  /* Propagate error */
                  .catch(rejectFile)
              }
            })
          })
        }))

          /* Merge nested suites and specifications */
          .then(data =>
            resolve(merge.all([...data, {}])))

          /* Propagate error */
          .catch(reject)
      })
    })
  }

  /**
   * Store specifications and nested suites for a suite
   *
   * @param {string} suite - Suite name
   * @param {Object} data - Specifications and nested suites
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
              json.writeFile(file, data.specs[name], { spaces: 2 }, err => {
                return err
                  ? rejectSpec(err)
                  : resolveSpec()
              })
            })
          }),

          /* Write nested suites */
          ...Object.keys(data.suites || {}).map(name => {
            if (typeof data.suites[name] !== "object")
              return Promise.reject(new TypeError(
                `Invalid contents: ${inspect(data.suites[name])}`))

            /* Recurse on nested suite */
            return this.store(path.join(suite, name), data.suites[name])
          })
        ])
      })
  }

  /**
   * Export all suites
   *
   * @return {Promise<Object>} Promise resolving with fetched data
   */
  export() {
    return this.fetch(".")
  }

  /**
   * Import suites
   *
   * @param {Object} data - Specifications and nested suites
   *
   * @return {Promise<undefined>} Promise resolving with no result
   */
  import(data) {
    return this.store(".", data)
  }

  /**
   * Create a scoped file system sub storage
   *
   * @param {...string} suites - Suite names
   *
   * @return {Promise<FileSystemStorage>} Promise resolving with storage
   */
  scope(...suites) {
    if (suites.find(suite => typeof suite !== "string" || !inrange(suite)) ||
        suites.length === 0)
      throw new TypeError(`Invalid scope: ${inspect(suites)}`)

    /* Ensure scoped base is present and return sub storage */
    const base = path.join(this.base_, ...suites)
    return mkdirp(base)
      .then(() => new FileSystemStorage(base))
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
 * @return {Promise<FileSystemStorage>} Promise resolving with storage
 */
export const factory = base => {
  return mkdirp(base)
    .then(() => new FileSystemStorage(base))
}
