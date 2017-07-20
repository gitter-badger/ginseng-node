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

import http from "http"
import yargs from "yargs"

import Ginseng from "./ginseng"

/* ----------------------------------------------------------------------------
 * Command line interface
 * ------------------------------------------------------------------------- */

const args = yargs
  .usage("Usage: ginseng <command> [options]")
  .detectLocale(false)
  .recommendCommands()

  /* Config file */
  .config("config", "path to config file")

  /* Dump (default) config file */
  .command("config", "dump (default) config file", command => {
    return command
      .usage("Usage: ginseng config")

      /* Example commands */
      .example("ginseng config")
  })

  /* Start server in foreground */
  .command("start", "start server in foreground", command => {
    return command
      .usage("Usage: ginseng start [options]")

      /* Server host/interface to use */
      .option("host", {
        describe: "server host/interface to use",
        type: "string",
        default: "::1"
      })

      /* Server port to bind on */
      .option("port", {
        describe: "server port to bind on",
        type: "number",
        default: 8080
      })

      /* Log format */
      .option("format", {
        describe: "log format",
        type: "string"
      })

      /* Example commands */
      .example("ginseng start")
      .example("ginseng start --config path/to/config.json")
      .example("ginseng start --port 8080")
      .example("ginseng start --host 192.168.0.23")
  })

  /* Update stage */
  .command("update", "update stage", command => {
    return command
      .usage("Usage: ginseng update [options] [<suite>]")

      /* Stage name */
      .option("stage", {
        describe: "stage name",
        type: "string",
        default: "baseline"
      })

      /* Filter by scope */
      .option("scope", {
        describe: "filter by scope (e.g. agent, os, device)",
        type: "string"
      })

      /* Example commands */
      .example("ginseng update")
      .example("ginseng update suite")
      .example("ginseng update nested/suite")
      .example("ginseng update --scope ie*")
      .example("ginseng update --scope */windows*")
      .example("ginseng update --stage baseline")
  })

  /* Display help message */
  .help("help", "display this message")

  /* Example commands */
  .example("ginseng config help")
  .example("ginseng start help")
  .example("ginseng update help")

  /* Return arguments */
  .argv

/* ----------------------------------------------------------------------------
 * Program
 * ------------------------------------------------------------------------- */

/* Initialize Ginseng and execute command */
const ginseng = new Ginseng(args.config)
switch (args._.shift()) {

  /* Dump (default) config file */
  case "config":
    process.stdout.write(`${JSON.stringify(ginseng.config, null, 2)}\n`)
    break

  /* Start server in the foreground */
  case "start":
    http.createServer(
      ginseng.middleware({ morgan: args.format })
    ).listen(args.port, args.host)
    process.stdout.write(`Server listening on ${args.host}:${args.port}\n`)
    break

  /* Update baseline */
  case "update":
    (args._.length ? args._ : ["*"]).forEach(suite => {
      ginseng.update(args.stage, suite, { scope: args.scope })
        .catch(err => {
          process.stderr.write(`${err.message}\n`)
          process.exit(1)
        })
    })
    break

  /* Unknown command, show help message */
  default:
    yargs.showHelp()
}
