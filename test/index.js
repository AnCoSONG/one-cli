const ora = require('ora')

const spinner = ora('test').start()

setTimeout(() => {
    spinner.info('info')
}, 2000)
setTimeout(() => {
    spinner.warn('warn')
}, 4000)
setTimeout(() => {
    spinner.succeed('succeed')
}, 6000)