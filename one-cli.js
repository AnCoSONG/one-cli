#!/usr/bin/env node
const program = require("commander");
const { getFormatTodayStr } = require("./utils");
const { resolve } = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: resolve(__dirname, ".env.local") });
dotenv.config({ path: resolve(__dirname, ".env") });

program.version("0.0.1").usage("<command> [options]");

program
  .command("post")
  .usage("[options]")
  .description("Post a markdown doc to blog.")
  .option("-t, --title <title>", "set title")
  .option("-a, --author <author>", "set author name", "JinYu SONG")
  .option("-d, --date <date>", "set date", getFormatTodayStr())
  .option("-p, --preface <preface>", "set the preface of each article")
  .option(
    "-m, --markdown <path-to-markdown>",
    "tell me where is the markdown document"
  )
  .action(async (opts) => {
    await require("./lib/post")(opts);
  });

program
  .command("delete <id>")
  .description("delete a blog post using id")
  .action(async (id) => {
    await require("./lib/delete")(id);
  });

program
  .command("update <id>")
  .description("update a blog post, options is optional")
  .option("-y, --yaml", "use yaml")
  .option("-t, --title <title>", "set title")
  .option("-a, --author <author>", "set author name")
  .option("-d, --date <date>", "set date")
  .option("-p, --preface <preface>", "set the preface of each article")
  .option(
    "-m, --markdown <path-to-markdown>",
    "tell me where is the markdown document"
  )
  .action(async (id, opts) => {
    await require("./lib/update")(id, opts);
  });

program.parse(process.argv);
