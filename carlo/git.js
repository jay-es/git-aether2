const fs = require('fs')
const simpleGit = require('simple-git/promise')

const repositories = {}

/**
 * SimpleGitインスタンスを作成
 * @param {string} basePath
 * @returns {Promise<simplegit.SimpleGit>}
 */
const createGit = async basePath => {
  // ディレクトリが存在するか確認
  if (!fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory()) {
    throw new Error('Not a directory')
  }

  const repo = simpleGit(basePath).silent(true)

  // Gitリポジトリかどうか確認
  if (!(await repo.checkIsRepo())) {
    throw new Error('Not a git repository')
  }

  return repo
}

/**
 * Gitの操作を実行
 * @param {string} basePath
 * @param {string} [methodName] 省略した場合はチェックのみ
 * @param {any[]} [args]
 * @returns {Promise<any>}
 */
module.exports = async (basePath, methodName, ...args) => {
  if (!repositories[basePath] || !methodName) {
    repositories[basePath] = await createGit(basePath)

    if (!methodName) return
  }

  return repositories[basePath][methodName](...args)
}
