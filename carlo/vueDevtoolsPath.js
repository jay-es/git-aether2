const fs = require('fs')
const path = require('path')

/** @type {string} Vue.js devtools Path */
module.exports = (() => {
  const { LOCALAPPDATA, HOME } = process.env
  const paths = ['Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd']

  // Win
  if (LOCALAPPDATA) {
    paths.unshift(LOCALAPPDATA, 'Google/Chrome/User Data')
  }

  // Mac
  if (HOME) {
    paths.unshift(HOME, 'Library/Application Support/Google/Chrome')
  }

  const basePath = path.resolve(...paths)

  if (!fs.existsSync(basePath)) return ''

  // 直下のディレクトリを1つ取得（readdirSyncのwithFileTypesオプションはv10.10から）
  const dirName = fs
    .readdirSync(basePath)
    .map(v => path.resolve(basePath, v))
    .find(v => fs.statSync(v).isDirectory())

  return dirName ? path.resolve(basePath, dirName) : ''
})()
