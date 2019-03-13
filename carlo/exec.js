const { exec } = require('child_process')

module.exports = (cwd, commandLine) => {
  exec(commandLine, { cwd })
}
