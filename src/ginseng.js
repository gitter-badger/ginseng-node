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
import { inspect } from "util"
import { validate } from "jsonschema"

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
  constructor(config = CONFIG_DEFAULT) {
    if (typeof config !== "object")
      throw new TypeError(`Invalid config: ${inspect(config)}`)
    this.config_ = config

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
   *
   * @return {Function} Connect-compatible middleware
   */
  middleware(options = {}) {
    if (typeof options !== "object")
      throw new TypeError(`Invalid options: ${inspect(options)}`)
    if (options.router && !(options.router instanceof Router))
      throw new TypeError(`Invalid router: ${inspect(options.router)}`)

    /* Create router and register scope handler */
    const router = options.router || new Router()
    router.use(scopeMiddleware(this.config_.scope))

    /* Register a route for each stage */
    this.config_.stages.forEach(stage =>
      router.use(`/${stage.name}`, stageMiddleware(
        storageFactory(stage.storage.type, ...stage.storage.args))
      ))

    /* Register error handler and return middleware */
    router.use(errorMiddleware())
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
  update(name, suite = null, options = {}) {
    return new Promise((resolve, reject) => {
      const index = this.config_.stages.findIndex(stage => stage.name === name)
      if (index === -1)
        return reject(new ReferenceError(
          `Invalid stage: ${inspect(name)} not found`))
      else if (!index)
        return reject(new ReferenceError(
          "Invalid stage: cannot update first stage"))

      /* Load and initialize stages */
      Promise.all([index - 1, index].map(s => {
        return new Promise((resolveStage, rejectStage) => {
          const stage = this.config_.stages[s]
          return storageFactory(stage.storage.type, ...stage.storage.args)
            .then(resolveStage)
            .catch(rejectStage)
        })
      }))

        /* Update target stage with data from source stage */
        .then(([source, target]) => {
          return source.export()
            .then(data => target.import([
              ...options.scope
                ? [{ pattern: options.scope }]
                : [],
              ...suite
                ? [{ pattern: suite, skip: this.config_.scope.length }]
                : []
            ].reduce(filter, data)))
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
