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

import minimatch from "minimatch"
import path from "path"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Filter specifications and nested suites
 *
 * @param {Object} data - Specifications and nested suites
 * @param {Object} options - Options
 * @param {string} options.pattern - Pattern for filtering
 * @param {number} [options.skip] - Layers to skip
 * @param {Array<string>} [base] - Base path
 *
 * @return {Object} Filtered specifications and nested suites
 */
export const filter = (data, options, base = []) => {
  return {
    suites: Object.keys(data.suites || {}).reduce((suites, name) => {
      const file = path.join(...base, name)

      /* Skip this layer */
      if (options.skip) {
        const nested = filter(data.suites[name], {
          ...options, skip: options.skip - 1
        })
        return Object.keys(nested.suites).length > 0
          ? { ...suites, [name]: nested }
          : suites

      /* Return suites if pattern matches */
      } else if (minimatch(file, options.pattern, { nocase: true })) {
        return { ...suites, [name]: data.suites[name] }
      }

      /* Try next layer, if pattern didn't match */
      const nested = filter(data.suites[name], options, [...base, name])
      return Object.keys(nested.suites).length > 0
        ? { ...suites, [name]: nested }
        : suites
    }, {})
  }
}

/**
 * Retrieve an array of suite names
 *
 * @param {Object} data - Specifications and nested suites
 * @param {Array<string>} [base] - Base path
 *
 * @return {Array<string>} Suite names
 */
export const names = (data, base = []) => {
  return [
    ...data.specs ? [path.join(...base)] : [],
    ...Object.keys(data.suites || {}).reduce((suites, name) => {
      return [...suites, ...names(data.suites[name], [...base, name])]
    }, [])
  ]
}
