[
    'spinner',
    'utils',
    'postMode',
    'parser',
    'request'
].forEach(m => {
    Object.assign(exports, require(`./lib/${m}`))
})

exports.chalk = require('chalk')
exports.inquirer = require('inquirer')