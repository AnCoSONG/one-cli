const chalk = require('chalk')
module.exports.getFormatTodayStr = (
  dateArr = new Date().toDateString().split(" ")
) => `${dateArr[1]} ${dateArr[2]} ${dateArr[3]}`;


module.exports.checkObjParameters = (obj,keys) => {
  for(let key of keys) {
    if(!obj.hasOwnProperty(key)) {
      throw new Error(`cannot find ${chalk.red(key)} in your input, please check.`)
    }
  }
  return true
}