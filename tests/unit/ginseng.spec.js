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
import * as data from "~/src/util/data"

import Ginseng from "~/src/ginseng"

/* ----------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

/* Ginseng */
describe("Ginseng", () => {

  /* Initialize configuration */
  beforeAll(function() {
    this.config = {
      "scope": [
        {
          "type": "agent",
          "version": ["major", "minor", "patch"]
        },
        {
          "type": "os",
          "version": ["major", "minor", "patch"]
        }
      ],
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

  /* #update */
  describe("#update", () => {

    /* Register spies */
    beforeEach(function() {
      this.storage = {
        export: jasmine.createSpy("export")
          .and.returnValue(Promise.resolve({ data: true })),
        import: jasmine.createSpy("import")
      }
      spyOn(storageFactory, "default")
        .and.returnValue(Promise.resolve(this.storage))
      spyOn(data, "filter")
        .and.callFake(data_ => data_)
    })

    /* Test: should return promise */
    it("should return promise",
      updateShouldReturnPromise
    )

    /* Test: should transfer data */
    it("should transfer data",
      updateShouldTransferData
    )

    /* Test: should filter scope */
    it("should filter scope",
      updateShouldFilterScope
    )

    /* Test: should filter nested scope */
    it("should filter nested scope",
      updateShouldFilterNestedScope
    )

    /* Test: should filter suite */
    it("should filter suite",
      updateShouldFilterSuite
    )

    /* Test: should filter nested suite */
    it("should filter nested suite",
      updateShouldFilterNestedSuite
    )

    /* Test: should reject on empty stage name */
    it("should reject on empty stage name",
      updateShouldRejectOnEmptyStageName
    )

    /* Test: should reject on invalid stage name */
    it("should reject on invalid stage name",
      updateShouldRejectOnInvalidStageName
    )

    /* Test: should reject on empty suite name */
    it("should reject on empty suite name",
      updateShouldRejectOnEmptySuiteName
    )

    /* Test: should reject on invalid suite name */
    it("should reject on invalid suite name",
      updateShouldRejectOnInvalidSuiteName
    )

    /* Test: should reject on invalid options */
    it("should reject on invalid options",
      updateShouldRejectOnInvalidOptions
    )

    /* Test: should reject on non-existing stage */
    it("should reject on non-existing stage",
      updateShouldRejectOnNonExistingStage
    )

    /* Test: should reject on first stage */
    it("should reject on first stage",
      updateShouldRejectOnFirstStage
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

/* ----------------------------------------------------------------------------
 * Definitions: #update
 * ------------------------------------------------------------------------- */

/* Test: #update should return promise */
function updateShouldReturnPromise(done) {
  expect(new Ginseng(this.config).update()
    .then(done)
    .catch(done)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #update should transfer data */
function updateShouldTransferData(done) {
  expect(new Ginseng(this.config).update("oolong")
    .then(() => {
      expect(this.storage.export)
        .toHaveBeenCalledWith()
      expect(this.storage.import)
        .toHaveBeenCalledWith({ data: true })
      done()
    })
    .catch(done.fail)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #update should filter scope */
function updateShouldFilterScope(done) {
  expect(new Ginseng(this.config).update("oolong", "*", {
    scope: "matcha/hojicha"
  })
    .then(() => {
      expect(data.filter)
        .toHaveBeenCalledWith({ data: true }, { pattern: "matcha/hojicha/*" })
      expect(data.filter.calls.count())
        .toEqual(1)
      done()
    })
    .catch(done.fail)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #update should filter nested scope */
function updateShouldFilterNestedScope(done) {
  expect(new Ginseng(this.config).update("oolong", "sencha", {
    scope: "matcha"
  })
    .then(() => {
      expect(data.filter)
        .toHaveBeenCalledWith({ data: true }, { pattern: "matcha/*/sencha" })
      expect(data.filter.calls.count())
        .toEqual(1)
      done()
    })
    .catch(done.fail)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #update should filter suite */
function updateShouldFilterSuite(done) {
  expect(new Ginseng(this.config).update("oolong", "sencha")
    .then(() => {
      expect(data.filter)
        .toHaveBeenCalledWith({ data: true }, { pattern: "*/*/sencha" })
      expect(data.filter.calls.count())
        .toEqual(1)
      done()
    })
    .catch(done.fail)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #update should filter nested suite */
function updateShouldFilterNestedSuite(done) {
  expect(new Ginseng(this.config).update("oolong", "sencha/*")
    .then(() => {
      expect(data.filter)
        .toHaveBeenCalledWith({ data: true }, { pattern: "*/*/sencha/*" })
      expect(data.filter.calls.count())
        .toEqual(1)
      done()
    })
    .catch(done.fail)
  ).toEqual(jasmine.any(Promise))
}

/* Test: #update should reject on empty stage name */
function updateShouldRejectOnEmptyStageName(done) {
  new Ginseng(this.config).update("")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid stage name: ''"))
      done()
    })
}

/* Test: #update should reject on invalid stage name */
function updateShouldRejectOnInvalidStageName(done) {
  new Ginseng(this.config).update(null)
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid stage name: null"))
      done()
    })
}

/* Test: #update should reject on empty suite name */
function updateShouldRejectOnEmptySuiteName(done) {
  new Ginseng(this.config).update("genmaicha", "")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: ''"))
      done()
    })
}

/* Test: #update should reject on invalid suite name */
function updateShouldRejectOnInvalidSuiteName(done) {
  new Ginseng(this.config).update("genmaicha", {})
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid suite name: {}"))
      done()
    })
}

/* Test: #update should reject on invalid options */
function updateShouldRejectOnInvalidOptions(done) {
  new Ginseng(this.config).update("genmaicha", "sencha", "invalid")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new TypeError("Invalid options: 'invalid'"))
      done()
    })
}

/* Test: #update should reject on non-existing stage */
function updateShouldRejectOnNonExistingStage(done) {
  new Ginseng(this.config).update("invalid")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new ReferenceError("Invalid stage: 'invalid' not found"))
      done()
    })
}

/* Test: #update should reject on first stage */
function updateShouldRejectOnFirstStage(done) {
  new Ginseng(this.config).update("genmaicha")
    .then(done.fail)
    .catch(err => {
      expect(err)
        .toEqual(new ReferenceError("Invalid stage: cannot update first stage"))
      done()
    })
}
