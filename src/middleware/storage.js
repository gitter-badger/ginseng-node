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

import body from "body-parser"
import router from "router"
import useragent from "useragent"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Initialize a middleware to fetch data from a storage
 *
 * @param {Object} storage - Storage
 *
 * @return {Function} Connect-compatible middleware
 */
export const get = storage => {
  return (req, res, next) => {
    const agent = useragent.parse(req.headers["user-agent"])

    /* Fetch data from storage and return promise for unit tests */             // TODO: check with Storage#valid, return 404
    return storage.fetch(req.params.path, [
      agent.toAgent(), agent.os.toString()
    ])
      .then(data => {
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify(data))
      })
      .catch(next)
  }
}

/**
 * Initialize a middleware to store data in a storage
 *
 * @param {Object} storage - Storage
 *
 * @return {Function} Connect-compatible middleware
 */
export const post = storage => {
  return (req, res, next) => {
    const agent = useragent.parse(req.headers["user-agent"])

    /* Fetch data from storage and return promise for unit tests */
    return storage.store(req.params.path, [
      agent.toAgent(), agent.os,toString()
    ], req.body)
      .then(() => {
        res.status(200)
        res.end()
      })
      .catch(next)
  }
}

/* ----------------------------------------------------------------------------
 * Factory
 * ------------------------------------------------------------------------- */

/**
 * Create a router
 *
 * @param {Object} storage - Storage
 *
 * @return {Object} Router
 */
export default storage => {
  const route = router()
  route.use(body.json())

  /* Register methods for router */
  route.get("/:path(\\S*)?", get(storage))
  route.post("/:path(\\S*)?", post(storage))

  /* Return router */
  return route
}
