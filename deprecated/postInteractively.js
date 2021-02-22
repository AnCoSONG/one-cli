const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora')
const { getFormatTodayStr } = require('./utils')
const { default: axios } = require('axios')
const {readFileSync} = require('fs')
const {resolve, isAbsolute} = require('path')

module.exports.postInteractively = async function(defaultValue={author:'', date:''}, realDir) {
    const {title, author, date, preface, dir} = await inquirer.prompt([{
        name: 'title',
        type: 'input',
        message: 'Title?'
    }, {
        name: 'author',
        type: 'input',
        message: 'Author?',
        default: defaultValue.author===''?'JinYu SONG':defaultValue.author
    }, {
        name: 'date',
        type: 'input',
        message: 'Date?',
        default: defaultValue.date===''?getFormatTodayStr():defaultValue.date
    }, {
        name: 'preface',
        type: 'input',
        message: 'Preface?'
    }, {
        name: 'dir',
        type: 'input',
        message: 'Content Dir?'
    }])
    console.clear()
    console.log('Here are your information:')
    console.log()
    console.log(`Title is : ${chalk.blueBright(title)}`)
    console.log(`Author is : ${chalk.blueBright(author)}`)
    console.log(`Date is : ${chalk.blueBright(date)}`)
    console.log(`Preface is : ${chalk.blueBright(preface)}`)
    console.log(`Content Dir is : ${chalk.blueBright(dir)}`)
    console.log()

    const {isContinue} = await inquirer.prompt([{
        name: 'isContinue',
        type: 'confirm',
        message: 'All correct?',
        default: true
    }])
    
    if(!isContinue) {
        console.log(chalk.white.bgRed('上传中止'))
        return
    }
    
    const spinner = ora('开始执行').start()
    try {
        let absolutePath = ''
        if (isAbsolute(dir)) {
            absolutePath = dir
        } else {
            absolutePath = resolve(realDir, dir)
        }
        spinner.text = "正在提取文件"
        const content = readFileSync(absolutePath, {encoding:'utf-8'})
        spinner.text = "正在上传"
        const result = await axios.post(`${process.env.URL}/article`, {
            title,
            author,
            date,
            preface,
            content
        })
        spinner.succeed(`已上传 ID: ${result.data.id}`)
    } catch (e) {
        console.error(e)
        spinner.fail('失败')
    }
}

// postInteractively()