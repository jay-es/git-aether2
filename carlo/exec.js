const { exec } = require('child_process')

module.exports = (cwd, command) => {
  exec(command, { cwd })
}
