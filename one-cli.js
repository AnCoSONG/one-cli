#!/usr/bin/env node
const program = require("commander");
const { getFormatTodayStr, checkObjParameters } = require("./lib/utils");
const { postInteractively } = require("./lib/postInteractively");
const ora = require("ora");
const chalk = require("chalk");
const { default: axios } = require("axios");
const { readFileSync } = require("fs");
const { resolve, isAbsolute } = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: resolve(__dirname, ".env.local") });
dotenv.config({ path: resolve(__dirname, ".env") });

program.version("0.0.1").usage("<command> [options]");

//? one post <mode>
// * mode=null -> 参数化提交
// * mode=i -> 交互式提交
program
  .command("post <mode>")
  .usage("<mode> [options]")

  .description("Post a md doc to blog. <mode> could be i or p or e.")
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
      const spinner = ora({ text: "正在执行" }).start();
      if (
        !checkObjParameters(opts, [
          "title",
          "author",
          "date",
          "preface",
          "markdown",
        ])
      ) {
        spinner.fail('参数检查不通过')
        return
      }
      try {
        spinner.text = '正在解析'
        let absolutePath = "";
        if (isAbsolute(opts.markdown)) {
          absolutePath = opts.markdown;
        } else {
          absolutePath = resolve(process.cwd(), opts.markdown);
        }
        const content = readFileSync(absolutePath, {
          encoding: "utf-8",
        });
        spinner.text = '正在上传'
        const result = (await axios.post(`${process.env.URL}/article`, {
          title: opts.title,
          author: opts.author,
          date: opts.date,
          preface: opts.preface,
          content,
        })).data;
        if(result.success) {
          spinner.succeed(`已上传 ID: ${result.id}`);
        } else {
          spinner.fail('上传失败 请检查上传参数')
        }
      } catch (e) {
        console.error(e);
        spinner.fail("失败");
      }
    } else if (mode === "i") {
      await postInteractively(opts, process.cwd());
    } else if (mode === "e") {
      // e means embedded. 从markdown的yaml头提取信息
      const spinner = ora({ text: "正在执行" }).start();
      if (!opts.hasOwnProperty("markdown")) {
        spinner.fail("请传入 -m 文件路径参数");
        return;
      }
      const fm = require("front-matter");
      try {
        let absolutePath = "";
        if (isAbsolute(opts.markdown)) {
          absolutePath = opts.markdown;
        } else {
          absolutePath = resolve(process.cwd(), opts.markdown);
        }
        const content = readFileSync(absolutePath, {
          encoding: "utf-8",
        });
        spinner.text = "正在解析"
        fm_result = fm(content);
        if (!checkObjParameters(fm_result.attributes, ["Title", "Preface"])) {
          spinner.fail("YAML头必须包含Title和Preface参数");
          return;
        }
        const createDto = {
          title: fm_result.attributes["Title"],
          author: fm_result.attributes.Author ?? "JinYu SONG",
          date: fm_result.attributes.Date ?? getFormatTodayStr(),
          preface: fm_result.attributes["Preface"],
          content: fm_result.body,
        };
        spinner.text = "正在上传"
        const result = (await axios.post(
          `${process.env.URL}/article`,
          createDto
        )).data;
        if(result.success) {
          spinner.succeed(`已上传 ID: ${result.id}`);
        } else {
          spinner.fail('上传失败 请检查上传参数')
        }
      } catch (e) {
        spinner.fail("上传失败 " + e.message);
      }
    } else {
      throw new Error("mode 参数设置错误[i|p]");
    }
  });

program
  .command("delete <id>")
  .description("delete a blog post using id")
  .action(async (id) => {
    const spinner = ora("正在删除").start();
    try {
      const res = (await axios.delete(`${process.env.URL}/article/${id}`)).data;
      if (res.success) {
        spinner.succeed(`已删除 ID:${res.id}`);
      } else {
        spinner.fail('删除失败 ' + res.error_msg)
      }
    } catch (e) {
      spinner.fail("删除失败 "+ e.message);
    }
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
    // console.log(opts)
    const spinner = ora("正在执行").start();
    if (Object.keys(opts).length === 0) {
      spinner.fail('没有提供任何参数')
      return;
    } else {
      try {
        const updateDTO = {};
        spinner.text = "正在解析"
        if (opts.hasOwnProperty("title")) {
          updateDTO.title = opts.title;
        }
        if (opts.hasOwnProperty("author")) {
          updateDTO.author = opts.author;
        }
        if (opts.hasOwnProperty("date")) {
          updateDTO.date = opts.date;
        }
        if (opts.hasOwnProperty("preface")) {
          updateDTO.preface = opts.preface;
        }
        if (opts.hasOwnProperty("markdown")) {
          updateDTO.content = readFileSync(
            resolve(process.cwd(), opts.markdown),
            { encoding: "utf-8" }
          );
          if (opts.hasOwnProperty('yaml')) {
            // 启用yaml会自动覆盖之前的
            const fm = require("front-matter");
            const fm_result = fm(updateDTO.content)
            if (!checkObjParameters(fm_result.attributes, ['Title', 'Preface'])) {
              spinner.fail("YAML HEADER必须拥有Title和Preface属性")
              return
            }
            updateDTO.title = fm_result.attributes.Title
            if (fm_result.attributes.Author) {
              updateDTO.author = fm_result.attributes.Author
            }
            if (fm_result.attributes.Date) {
              updateDTO.date = fm_result.attributes.Date
            }
            updateDTO.preface = fm_result.attributes.Preface
            updateDTO.content = fm_result.body
          }
        }
        // console.log(id, opts, updateDTO)
        const result = (await axios.put(
          `${process.env.URL}/article/${id}`,
          updateDTO
        )).data;
        if (result.success) {
          spinner.succeed(`已更新 ID: ${result.id}`);
        } else {
          spinner.fail(`更新失败，请检查ID是否正确`)
        }
      } catch (e) {
        spinner.fail("更新失败 " + e.message);
      }
    }
  });
program.parse(process.argv);
