// yaml header parser
const fm = require('front-matter')

exports.parse = function(content) {
    const fm_result = fm(content)
    return fm_result
}