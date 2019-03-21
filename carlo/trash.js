const trash = require('trash')
const { resolve } = require('path')

module.exports = (...paths) => {
  trash(resolve(...paths))
}
