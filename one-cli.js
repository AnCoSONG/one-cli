#!/usr/bin/env node
const program = require("commander");
const { getFormatTodayStr, checkObjParameters } = require("./lib/utils");
const { postInteractively } = require("./lib/postInteractively");
const ora = require("ora");
const chalk = require("chalk");
const { default: axios } = require("axios");
const {readFileSync} = require('fs')
const {resolve, isAbsolute} = require('path');
const dotenv = require("dotenv")
dotenv.config({path: resolve(__dirname, '.env.local')})
dotenv.config({path: resolve(__dirname, '.env')})
program.version("0.0.1").usage('<command> [options]');

//? one post <mode>
// * mode=null -> 参数化提交
// * mode=i -> 交互式提交
program
  .command("post <mode>")
  .usage("<mode> [options]")

  .description("Post a md doc to blog. <mode> could be i or p.")
  .option("-t, --title <title>", "set title")
  .option("-a, --author <author>", "set author name", "JinYu SONG")
  .option("-d, --date <date>", "set date", getFormatTodayStr())
  .option("-p, --preface <preface>", "set the preface of each article")
  .option(
    "-m, --markdown <path-to-markdown>",
    "tell me where is the markdown document"
  )
  .action(async (mode, opts) => {
    // console.log(mode, opts);
    if (mode === "p") {
      if (
        checkObjParameters(opts, [
          "title",
          "author",
          "date",
          "preface",
          "markdown",
        ])
      ) {
        const spinner = ora({ text: "posting" }).start();
        try {
          let absolutePath = ''
          if(isAbsolute(opts.markdown)) {
            absolutePath = opts.markdown
          } else {
            absolutePath = resolve(process.cwd(), opts.markdown)
          }
          const content = readFileSync(absolutePath, {
            encoding: "utf-8",
          });
          const result = await axios.post(`${process.env.URL}/article`, {
            title: opts.title,
            author: opts.author,
            date: opts.date,
            preface: opts.preface,
            content,
          });
          spinner.succeed(`已上传 ID: ${result.data.id}`);
        } catch (e) {
          console.error(e);
          spinner.fail("失败");
        }
      }
    } else if (mode === "i") {
      await postInteractively(opts, process.cwd());
    } else {
      throw new Error("mode 参数设置错误[i|p]");
    }
  });

program
  .command("delete <id>")
  .description("delete a blog post with id")
  .action(async (id) => {
    const spinner = ora("正在删除").start();
    try {
      const res = (await axios.delete(`${process.env.URL}/article/${id}`)).data;
      spinner.succeed(`已删除 ID:${res._id}`);
    } catch (e) {
      console.error(e);
      spinner.fail("删除失败");
    }
  });

program.parse(process.argv);
