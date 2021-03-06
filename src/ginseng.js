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

import finalhandler from "finalhandler"
import morgan from "morgan"
import path from "path"
import { validate } from "jsonschema"
import { inspect } from "util"

import Router from "router"

import errorMiddleware from "./middlewares/error"
import scopeMiddleware from "./middlewares/scope"
import stageMiddleware from "./middlewares/stage"
import storageFactory from "./storages"
import { filter } from "./util/data"

import CONFIG_DEFAULT from "./config/default"
import CONFIG_SCHEMA from "./config/schema"

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

export default class Ginseng {

  /**
   * Create a Ginseng instance
   *
   * @constructor
   *
   * @property {Object} config_ - Configuration
   *
   * @param {Object} [config] - Configuration
   */
  constructor(config = null) {
    if (config !== null && typeof config !== "object")
      throw new TypeError(`Invalid config: ${inspect(config)}`)
    this.config_ = config || CONFIG_DEFAULT

    /* Validate schema and throw on first error */
    const result = validate(this.config_, CONFIG_SCHEMA)
    if (result.errors.length)
      throw new TypeError(`Invalid config: ${result.errors[0].stack}`)
  }

  /**
   * Return a connect-compatible middleware
   *
   * @param {Object} [options={}] - Options
   * @param {Router} [options.router] - Router reference, if given
   * @param {(string|Function|Boolean)} [options.morgan] - Morgan configuration
   *
   * @return {Function} Connect-compatible middleware
   */
  middleware(options = {}) {
    if (typeof options !== "object")
      throw new TypeError(`Invalid options: ${inspect(options)}`)
    if (options.router && !(options.router instanceof Router))
      throw new TypeError(`Invalid router: ${inspect(options.router)}`)

    /* Create router and register scope middleware */
    const router = options.router || new Router()
    router.use(scopeMiddleware(this.config_.scope))

    /* Configure morgan logger */
    if (options.morgan !== false)
      router.use(morgan(options.morgan || "dev"))                               // TODO: implement custom logger

    /* Register a route for each stage */
    this.config_.stages.forEach(stage =>
      router.use(`/${stage.name}`, stageMiddleware(
        storageFactory(stage.storage.type, ...stage.storage.args))
      ))

    /* Register error handler and return middleware */
    router.use(errorMiddleware())
    /* istanbul ignore next: tested via smoke test */
    return (req, res) => {
      router(req, res, finalhandler(req, res))
    }
  }

  /**
   * Update given stage with data of previous stage
   *
   * @param {string} name - Stage name
   * @param {string} [suite] - Suite name
   * @param {Object} [options] - Update options
   *
   * @return {Promise<void>} Promise resolving with no result
   */
  update(name, suite = "*", options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof name !== "string" || !name.length)
        return reject(new TypeError(`Invalid stage name: ${inspect(name)}`))    // TODO: check stagename validity --> schema????
      if (suite !== "*" && (typeof suite !== "string" || !suite.length))
        return reject(new TypeError(`Invalid suite name: ${inspect(suite)}`))   // TODO: check suite name validity
      if (typeof options !== "object")
        return reject(new TypeError(`Invalid options: ${inspect(options)}`))

      /* Find index of given stage */
      const index = this.config_.stages.findIndex(stage => stage.name === name)
      if (index === -1)
        return reject(new ReferenceError(
          `Invalid stage: ${inspect(name)} not found`))
      else if (!index)
        return reject(new ReferenceError(
          "Invalid stage: cannot update first stage"))

      /* Expand scope with "*" */
      const scope = options.scope || "*"
      const count = this.config_.scope.length - scope.split("/").length

      /* Load and initialize stages */
      Promise.all([index - 1, index]
        .map(s => this.config_.stages[s])
        .map(stage =>
          storageFactory(stage.storage.type, ...stage.storage.args))
      )

        /* Update target stage with data from source stage */
        .then(([source, target]) => {
          return source.export()
            .then(data => target.import(
              filter(data, {
                pattern: path.join(scope, "/*".repeat(count), suite)
              })
            ))
        })

        /* Resolve with no result */
        .then(resolve)

        /* Propagate error */
        .catch(reject)
    })
  }

  /**
   * Retrieve configuration
   *
   * @return {Object} Configuration
   */
  get config() {
    return this.config_
  }
}
