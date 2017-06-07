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
import { inspect } from "util"

import Router from "router"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Initialize a middleware to fetch data from a storage
 *
 * This method will scope the storage, if the scope was set by another
 * middleware on the request object.
 *
 * @param {Promise<Object>} init - Promise resolving with storage
 *
 * @return {Function} Connect-compatible middleware
 */
export const get = init => {
  if (!(init instanceof Promise))
    throw new TypeError(`Invalid initializer: ${inspect(init)}`)

  /* Return connect-compatible middleware */
  return (req, res, next) => {
    req.scope = req.scope || []

    /* Wait for base storage to be ready */
    return init.then(base => {
      return req.scope.length
        ? base.scope(...req.scope)
        : base
    })

      /* Handle request on scoped sub storage */
      .then(storage => {

        /* Check if the given directory exists */
        if (!storage.valid(req.params.path)) {
          res.statusCode = 404 // Not Found
          return Promise.reject(new ReferenceError("Invalid path: " +
            `${inspect(req.params.path)} not found for ${inspect(req.scope)}`))
        }

        /* Fetch data from storage */
        return storage.fetch(req.params.path).then(data => {
          res.statusCode = 200 // OK
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify(data))
        })
      })

      /* Forward unhandled errors to error handler */
      .catch(err => {
        if (res.statusCode >= 200 && res.statusCode <= 299)
          res.statusCode = 500 // Internal Server Error
        next(err)
      })
  }
}

/**
 * Initialize a middleware to store data in a storage
 *
 * This method will scope the storage, if the scope was set by another
 * middleware on the request object.
 *
 * @param {Promise<Object>} init - Promise resolving with storage
 *
 * @return {Function} Connect-compatible middleware
 */
export const post = init => {
  if (!(init instanceof Promise))
    throw new TypeError(`Invalid initializer: ${inspect(init)}`)

  /* Return connect-compatible middleware */
  return (req, res, next) => {
    req.scope = req.scope || []

    /* Wait for base storage to be ready */
    return init.then(base => {
      return req.scope.length
        ? base.scope(...req.scope)
        : base
    })

      /* Handle request on scoped sub storage */
      .then(storage => {

        /* Store data in storage */
        return storage.store(req.params.path, req.body).then(() => {
          res.statusCode = 201 // Created
          res.end()
        })
      })

      /* Forward unhandled errors to error handler */
      .catch(err => {
        res.statusCode = 500 // Internal Server Error
        next(err)
      })
  }
}

/* ----------------------------------------------------------------------------
 * Factory
 * ------------------------------------------------------------------------- */

/**
 * Create a router to fetch from and store data to a stage
 *
 * @param {Promise<Object>} init - Promise resolving with storage
 * @param {Object} [options={}] - Options
 * @param {Router} [options.router] - Router reference, if given
 *
 * @return {Router} Router, connect-compatible middleware
 */
export default (init, options = {}) => {
  if (typeof options !== "object")
    throw new TypeError(`Invalid options: ${inspect(options)}`)
  if (options.router && !(options.router instanceof Router))
    throw new TypeError(`Invalid router: ${inspect(options.router)}`)

  /* Create router and add JSON parser middleware */
  const router = options.router || new Router()
  router.use(body.json())

  /* Register methods for router */
  router.get("/:path(\\S*)?", get(init))
  router.post("/:path(\\S*)?", post(init))

  /* Return router */
  return router
}
