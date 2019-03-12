const fs = require('fs')
const simpleGit = require('simple-git/promise')

const reps = {}

/**
 * 実在するディレクトリかどうか
 * @param {string} path 調べるパス
 * @return {boolean}
 */
const isDirectory = path =>
  fs.existsSync(path) && fs.statSync(path).isDirectory()

module.exports = async (basePath, methodName, ...args) => {
  if (!reps[basePath]) {
    // ディレクトリが存在するか
    if (!isDirectory(basePath)) {
      throw new Error('Not a directory')
    }

    const rep = simpleGit(basePath).silent(true)

    // Gitリポジトリかどうか確認
    try {
      await rep.status()
    } catch (e) {
      throw new Error('Not a git repository')
    }

    reps[basePath] = rep
  }

  return reps[basePath][methodName](...args)
}
