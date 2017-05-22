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

import path from "path"

import Jasmine from "jasmine"
import { SpecReporter } from "jasmine-spec-reporter"

/* ----------------------------------------------------------------------------
 * Entrypoint
 * ------------------------------------------------------------------------- */

/* Reset console in watch mode */
if (process.env.NODE_ENV === "development")
  process.stdout.write("\x1Bc")

/* Create new test suite from config file */
const jasmine = new Jasmine()
jasmine.loadConfigFile(
  path.resolve(__dirname, "jasmine.json"))

/* Configure spec reporter *//
jasmine.clearReporters()
jasmine.addReporter(new SpecReporter({
  spec: {
    displayStacktrace: true
  }
}))

/* Start test runner */
jasmine.execute()
