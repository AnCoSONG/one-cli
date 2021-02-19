//todo: 使用commander重写
//todo: 使用ora实现旋转

const { default: axios } = require("axios");
const {readFileSync} = require("fs");
const path = require("path");
require('dotenv').config(); // load .env inthe process.env
let title = "";
let author = "";
const date = ((dateArr = new Date().toDateString().split(" ")) =>
  `${dateArr[1]} ${dateArr[2]} ${dateArr[3]}`)();
let preface = "";
let contentDir = "";
let content = "";
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
console.log(process.env.URL)
rl.question("Title?\n", (answer) => {
  title = answer;
  rl.question("Author?\n", (answer) => {
    author = answer;
    rl.question("Preface?\n", (answer) => {
      preface = answer;
      rl.question("Content dir?\n", (answer) => {
        contentDir = answer;
        rl.close()
        try {
          const fulldir = path.resolve(__dirname, contentDir)
          content = readFileSync(fulldir,{encoding:'utf-8'})
        } catch (e) {
          throw new Error(e);
        }
        axios
          .post(process.env.URL, {
            title,
            author,
            date,
            preface,
            content,
          })
          .then((res) => {
            console.log(res.data);
          });
      });
    });
  });
});
