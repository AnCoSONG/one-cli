const {
  getFormatTodayStr,
  checkObjParametersWithoutThrowError,
  checkObjParameters,
  chalk,
  inquirer,
  logWithSpinner,
  succeedSpinner,
  failSpinner,
  modes,
  parse,
  postBlog,
} = require("../utils");
const { readFileSync } = require("fs");
const { resolve, isAbsolute } = require("path");
// 推送模块
async function post(opts) {
  //! post 思路
  //* 1. 首先检测是否是参数提交，即参数是否都提供好了
  //* 2. 如果不是参数提交提问是使用哪种方式提交更新(交互式或者直接提交问题)
  //* 3. 使用提问的话就走先把问题提完
  //* 4. 使用yaml header的直接问一下文件路径就直接提交
  const createDto = {};
  let md_path = null;
  let _mode = null;
  if (
    checkObjParametersWithoutThrowError(opts, [
      "title",
      "author",
      "date",
      "preface",
      "markdown",
    ])
  ) {
    // 参数模式
    createDto.title = opts.title;
    createDto.author = opts.author;
    createDto.date = opts.date;
    createDto.preface = opts.preface;
    md_path = opts.markdown;
    _mode = 0;
  } else {
    // 提问
    const {
      mode,
      title,
      author,
      date,
      preface,
      markdown,
    } = await inquirer.prompt([
      {
        type: "list",
        name: "mode",
        message: "Which mode do you prefer?",
        default: 1,
        choices: ["通过问答设置元信息", "通过YAML Header提取元信息"],
      },
      {
        type: "input",
        name: "title",
        message: "What's the title?",
        when: function (answers) {
          return answers.mode === "通过问答设置元信息";
        },
      },
      {
        type: "input",
        name: "author",
        message: "What's the author?",
        default: "JinYu SONG",
        when: function (answers) {
          return answers.mode === "通过问答设置元信息";
        },
      },
      {
        type: "input",
        name: "date",
        message: "What's the date?",
        default: getFormatTodayStr(),
        when: function (answers) {
          return answers.mode === "通过问答设置元信息";
        },
      },
      {
        type: "input",
        name: "preface",
        message: "What's the preface?",
        when: function (answers) {
          return answers.mode === "通过问答设置元信息";
        },
      },
      {
        type: "input",
        name: "markdown",
        message: "What's the path to the markdown file?",
      },
    ]);
    if (mode === "通过问答设置元信息") {
      createDto.title = title;
      createDto.author = author;
      createDto.date = date;
      createDto.preface = preface;
      md_path = markdown;
      _mode = 1;
    } else if (mode === "通过YAML Header提取元信息") {
      md_path = markdown;
      _mode = 2;
    } else {
      throw new Error("未知错误: " + mode);
    }
  }
  try {
    logWithSpinner(`开始执行推送 采用模式: ${modes[_mode]}`);
    // 统一加载本地markdown文件
    logWithSpinner("正在加载文件");
    if (!md_path) {
      throw new Error("您没有指定markdown文件路径");
    }

    if (!isAbsolute(md_path)) {
      md_path = resolve(process.cwd(), md_path);
    }
    const content = readFileSync(md_path, { encoding: "utf-8" });
    createDto.content = content;
    if (_mode === 2) {
      // yaml
      logWithSpinner("正在解析文件");
      const parse_result = parse(content);
      if (
        !checkObjParametersWithoutThrowError(parse_result.attributes, [
          "Title",
          "Preface",
        ])
      ) {
        throw new Error(
          chalk.white.bgRedBright(
            "如使用Yaml header设置元信息，请至少设置`Title`与`Preface`属性!"
          )
        );
      }
      createDto.title = parse_result.attributes.Title;
      createDto.author = parse_result.attributes.Author ?? "JinYu SONG";
      createDto.date = parse_result.attributes.Date ?? getFormatTodayStr();
      createDto.preface = parse_result.attributes.Preface;
      createDto.content = parse_result.body;
    }
    // 统一提交
    logWithSpinner("正在提交");
    // console.log(createDto)
    const result = await postBlog(createDto);
    if (result.success) {
      // 完成 成功 or 失败
      succeedSpinner("已成功, ID: " + result.id);
    } else {
      throw new Error("未知错误: " + JSON.stringify(result));
    }
  } catch (e) {
    failSpinner("推送失败: " + e.message);
  }
}
module.exports = async (opts) => {
  return await post(opts).catch((err) => {
    console.error(err.message);
  });
};
