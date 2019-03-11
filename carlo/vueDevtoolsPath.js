const fs = require('fs')
const path = require('path')

/** @type {string} Vue.js devtools Path */
module.exports = (() => {
  const basePath = path.resolve(
    process.env.LOCALAPPDATA,
    'Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd'
  )

  if (!fs.existsSync(basePath)) return ''

  const files = fs.readdirSync(basePath, { withFileTypes: true })
  const dir = files.find(v => v.isDirectory())

  return dir ? path.resolve(basePath, dir.name) : ''
})()
