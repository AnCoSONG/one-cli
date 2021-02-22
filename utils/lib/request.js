// axios request module
const axios = require('axios').default

function checkProcessEnv(){
    if(!process.env.URL) {
        throw new Error("process.env.URL is invalid, maybe the `dotenv` is not working.")
    }
}
exports.postBlog = async function(createDto) { // throw error 交给外部catch
    checkProcessEnv()
    const result = (await axios.post(`${process.env.URL}/article`, createDto)).data
    return result
}

exports.deleteBlog = async function(id) {
    checkProcessEnv()
    const result = (await axios.delete(`${process.env.URL}/article/${id}`)).data
    return result
}

exports.updateBlog = async function(id, updateDTO) {
    checkProcessEnv()
    const result = (await axios.put(`${process.env.URL}/article/${id}`, updateDTO)).data
}