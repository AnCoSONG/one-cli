const ora = require('ora')
const spinner = ora()
const chalk = require('chalk')

let prevMsg = null
exports.logWithSpinner = function(text) {
    if(prevMsg) {
        spinner.stopAndPersist({
            text: prevMsg,
            symbol: chalk.green('✔')
        })
    }
    spinner.start(text)
    prevMsg = text
}

exports.succeedSpinner = function(text) {
    prevMsg = null
    spinner.succeed(text)
}

exports.infoSpinner = function(text) {
    prevMsg = null
    spinner.info(text)
}

exports.warnSpinner = function(text) {
    prevMsg = null
    spinner.warn(text)
}

exports.failSpinner = function(text) {
    prevMsg = null
    spinner.fail(text)
}

exports.stopSpinner = function() {
    if(prevMsg) {
        spinner.stopAndPersist({
            text: prevMsg,
            symbol: chalk.green('✔')
        })
    }
    prevMsg = null
}
