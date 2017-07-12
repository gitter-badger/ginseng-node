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

import Router from "router"

import * as errorMiddleware from "~/src/middlewares/error"
import * as scopeMiddleware from "~/src/middlewares/scope"
import * as stageMiddleware from "~/src/middlewares/stage"
import * as storageFactory from "~/src/storages"

import Ginseng from "~/src/ginseng"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* Ginseng */
describe("Ginseng", () => {

  /* Initialize configuration */
  beforeAll(function() {
    this.config = {
      "scope": [],
      "stages": [
        {
          "name": "genmaicha",
          "storage": {
            "type": "filesystem",
            "args": []
          }
        },
        {
          "name": "oolong",
          "storage": {
            "type": "filesystem",
            "args": []
          }
        }
      ]
    }
  })

  /* #constructor */
  describe("#constructor", () => {

    /* Test: should set configuration */
    it("should set configuration",
      constructorShouldSetConfiguration
    )

    /* Test: should use default configuration */
    it("should use default configuration",
      constructorShouldUseDefaultConfiguration
    )

    /* Test: should throw on invalid configuration */
    it("should throw on invalid configuration",
      constructorShouldThrowOnInvalidConfiguration
    )

    /* Test: should throw on invalid configuration validation */
    it("should throw on invalid configuration validation",
      constructorShouldThrowOnInvalidConfigurationValidation
    )
  })

  /* #middleware */
  describe("#middleware", () => {

    /* Register spies */
    beforeEach(() => {
      [errorMiddleware, scopeMiddleware, stageMiddleware]
        .forEach(middleware => {
          spyOn(middleware, "default")
            .and.returnValue(() => {})
        })
      spyOn(storageFactory, "default")
    })

    /* Test: should return connect-compatible middleware */
    it("should return connect-compatible middleware",
      middlewareShouldReturnConnectCompatibleMiddleware
    )

    /* Test: should use default router */
    it("should use default router",
      middlewareShouldUseDefaultRouter
    )

    /* Test: should use scope middleware */
    it("should use scope middleware",
      middlewareShouldUseScopeMiddleware
    )

    /* Test: should use stage middleware */
    it("should use stage middleware",
      middlewareShouldUseStageMiddleware
    )

    /* Test: should use error middleware */
    it("should use error middleware",
      middlewareShouldUseErrorMiddleware
    )

    /* Test: should initialize storages */
    it("should initialize storages",
      middlewareShouldInitializeStorages
    )

    /* Test: should throw on invalid options */
    it("should throw on invalid options",
      middlewareShouldThrowOnInvalidOptions
    )

    /* Test: should throw on invalid router */
    it("should throw on invalid router",
      middlewareShouldThrowOnInvalidRouter
    )
  })
})

/* ----------------------------------------------------------------------------
 * Definitions: #constructor
 * ------------------------------------------------------------------------- */

/* Test: #constructor should set configuration */
function constructorShouldSetConfiguration() {
  expect(new Ginseng(this.config).config)
    .toEqual(this.config)
}

/* Test: #constructor should use default configuration */
function constructorShouldUseDefaultConfiguration() {
  const ginseng = new Ginseng()
  expect(ginseng.config)
    .toEqual(jasmine.any(Object))
  expect(ginseng.config.scope)
    .toEqual(jasmine.any(Array))
  expect(ginseng.config.stages)
    .toEqual(jasmine.any(Array))
}

/* Test: #constructor should throw on invalid configuration */
function constructorShouldThrowOnInvalidConfiguration() {
  expect(() => {
    new Ginseng("")
  }).toThrow(
    new TypeError("Invalid config: ''"))
}

/* Test: #constructor should throw on invalid configuration validation */
function constructorShouldThrowOnInvalidConfigurationValidation() {
  expect(() => {
    new Ginseng({ invalid: true })
  }).toThrow(
    jasmine.any(TypeError))
}

/* ----------------------------------------------------------------------------
 * Definitions: #middleware
 * ------------------------------------------------------------------------- */

/* Test: #middleware should return connect-compatible middleware */
function middlewareShouldReturnConnectCompatibleMiddleware() {
  const router = new Router()
  const middleware = new Ginseng(this.config).middleware({ router })
  expect(middleware)
    .toEqual(jasmine.any(Function))
  expect(middleware.length)
    .toEqual(2)
}

/* Test: #middleware should return default router */
function middlewareShouldUseDefaultRouter() {
  const middleware = new Ginseng(this.config).middleware()
  expect(middleware)
    .toEqual(jasmine.any(Function))
  expect(middleware.length)
    .toEqual(2)
}

/* Test: #middleware should use scope middleware */
function middlewareShouldUseScopeMiddleware() {
  new Ginseng(this.config).middleware()
  expect(scopeMiddleware.default)
    .toHaveBeenCalledWith(this.config.scope)
}

/* Test: #middleware should use stage middleware */
function middlewareShouldUseStageMiddleware() {
  const router = new Router()
  spyOn(router, "use")
  new Ginseng(this.config).middleware({ router })
  expect(router.use)
    .toHaveBeenCalledWith("/genmaicha", jasmine.any(Function))
  expect(router.use)
    .toHaveBeenCalledWith("/oolong", jasmine.any(Function))
  expect(stageMiddleware.default.calls.count())
    .toEqual(2)
}

/* Test: #middleware should use error middleware */
function middlewareShouldUseErrorMiddleware() {
  new Ginseng(this.config).middleware()
  expect(errorMiddleware.default)
    .toHaveBeenCalled()
}

/* Test: #middleware should initialize storages */
function middlewareShouldInitializeStorages() {
  new Ginseng(this.config).middleware()
  this.config.stages.forEach(stage => {
    expect(storageFactory.default)
      .toHaveBeenCalledWith(stage.storage.type, ...stage.storage.args)
  })
}

/* Test: #middleware should throw on invalid options */
function middlewareShouldThrowOnInvalidOptions() {
  expect(() => {
    new Ginseng(this.config).middleware("invalid")
  }).toThrow(
    new TypeError("Invalid options: 'invalid'"))
}

/* Test: #middleware should throw on invalid router */
function middlewareShouldThrowOnInvalidRouter() {
  expect(() => {
    new Ginseng(this.config).middleware({ router: "invalid" })
  }).toThrow(
    new TypeError("Invalid router: 'invalid'"))
}
