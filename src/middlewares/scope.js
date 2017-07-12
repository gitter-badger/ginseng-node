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

import useragent from "useragent"
import { inspect } from "util"

/* ----------------------------------------------------------------------------
 * Factory
 * ------------------------------------------------------------------------- */

/**
 * Initialize a middleware to extract the scope of a request
 *
 * @param {Array<Object>} [scope=[]] - Scope configuration
 *
 * @return {Function} Connect-compatible middleware
 */
export default (scope = []) => {
  if (!(scope instanceof Array))
    throw new TypeError(`Invalid scope: ${inspect(scope)}`)
  scope.forEach(part => {
    if (!["agent", "os", "device"].includes(part.type))
      throw new TypeError(`Invalid type: ${inspect(part.type)}`)
    if (!(part.version instanceof Array))
      throw new TypeError(`Invalid version: ${inspect(part.version)}`)
    part.version.forEach(level => {
      if (!["major", "minor", "patch"].includes(level))
        throw new TypeError(`Invalid version level: ${inspect(level)}`)
    })
  })

  /* Return connect-compatible middleware */
  return (req, res, next) => {
    const agent = useragent.parse(req.headers["user-agent"]).toJSON()
    req.scope = scope.reduce((parts, part) => {
      const current = { agent, os: agent.os, device: agent.device }[part.type]

      /* Assemble scope */
      return [...parts, [current.family,
        part.version.reduce((levels, level) =>
          [...levels, current[level]], []).join(".")
      ].join(" ")]
    }, []).join("/")

    /* Forward request to next middleware */
    next()
  }
}
