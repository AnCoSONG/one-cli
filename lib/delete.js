// 删除模块
const {
    logWithSpinner,
    succeedSpinner,
    failSpinner,
    deleteBlog
} = require('../utils')
async function remove(id) {
    try {
        logWithSpinner('正在执行删除 ID: '+id)
        const result = await deleteBlog(id)
        if (result.success) {
            succeedSpinner('已删除 ID:' + result.id)
        } else {
            throw new Error(result.error_msg)
        }
    } catch (e) {
        failSpinner('删除失败: ' + e.message)
    }

}
module.exports = async (id) => {
    return await remove(id).catch(err => {
        failSpinner(err.message);
    })
}