const { logWithSpinner, failSpinner, warnSpinner, succeedSpinner, infoSpinner } = require('../utils/lib/spinner')
const utils = require('../utils')
// console.log(utils)
setTimeout(() => {
    logWithSpinner('正在执行')
}, 2000)
setTimeout(() => {
    logWithSpinner('正在解析')
}, 4000)

setTimeout(() => {
    infoSpinner('解析成功')
}, 6000)

setTimeout(() => {
    failSpinner('开始执行')
}, 8000)

setTimeout(() => {
    warnSpinner('执行失败')
}, 10000)
