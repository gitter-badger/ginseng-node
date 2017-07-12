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

import { inspect } from "util"

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

export default class AbstractStorage {

  /**
   * Abstract storage
   *
   * @abstract
   * @constructor
   */
  constructor() {
    if (this.constructor === AbstractStorage)
      throw new TypeError("Invalid call to constructor of abstract class")

    /* Check all relevant methods are implemented */
    ;["valid", "fetch", "store", "export", "import", "scope"].forEach(name => {
      if (!this[name])
        throw new TypeError(
          `Invalid storage: missing implementation for ${inspect(name)}`)
    })
  }
}
