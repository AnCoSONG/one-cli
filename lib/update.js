// 更新模块
const {
    logWithSpinner,
    succeedSpinner,
    failSpinner,
    updateBlog,
    parse,
    checkObjParametersWithoutThrowError,
} = require('../utils')
const { readFileSync } = require("fs");
const { resolve, isAbsolute } = require("path");
async function update(id, opts) {
    try {
        logWithSpinner('正在执行')
        if(Object.keys(opts).length === 0) {
            throw new Error('更新需要提供至少一个参数')
        }
        const updateDto = {}
        let md_path = null
        logWithSpinner('正在解析')
        if(opts.title) {
            updateDto.title = opts.title
        }
        if(opts.author) {
            updateDto.author = opts.author
        }
        if(opts.date) {
            updateDto.date = opts.date
        }
        if(opts.preface){
            updateDto.preface = opts.preface
        }
        if(opts.markdown) {
            md_path = opts.markdown
            if(!isAbsolute(md_path)) {
                md_path = resolve(process.cwd(), md_path)
            }
            logWithSpinner('正在加载文件')
            updateDto.content = readFileSync(md_path, {encoding: 'utf-8'});
        }

        if(opts.yaml) {
            if (!md_path) {
                throw new Error('请提供markdown文件路径')
            }
            logWithSpinner('正在解析 YAML header')
            const parse_result = parse(updateDto.content)
            if(!checkObjParametersWithoutThrowError(parse_result.attributes, ["Title", "Preface"])) {
                throw new Error("YAML HEADER必须拥有Title和Preface属性")
            }
            updateDto.title = parse_result.attributes.Title
            if (parse_result.attributes.Author) {
              updateDto.author = parse_result.attributes.Author
            }
            if (parse_result.attributes.Date) {
              updateDto.date = parse_result.attributes.Date
            }
            updateDto.preface = parse_result.attributes.Preface
            updateDto.content = parse_result.body
        }
        logWithSpinner('正在提交')
        const result = await updateBlog(id, updateDto)
        if(result.success) {
            succeedSpinner('已更新 ID: ' + result.id)
        }else {
            throw new Error(result.error_msg)
        }
    } catch (e) {
        failSpinner('更新失败: ' + e.message)
    }
}

module.exports = async (id, opts) => {
    return await update(id, opts).catch(err => {
        failSpinner(err.message)
    })
}