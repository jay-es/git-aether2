const fs = require('fs')

/**
 * 実在するディレクトリかどうか
 * @param {string} path 調べるパス
 * @return {boolean}
 */
module.exports = path => fs.existsSync(path) && fs.statSync(path).isDirectory()
