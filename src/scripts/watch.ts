import { watch } from 'fs'

export default (basePath: string, callback: () => void) =>
  watch(basePath, { recursive: true }, (eventType, filename) => {
    // Gitディレクトリは除外（startsWith だと .gitignore なども弾かれてしまうので正規表現）
    if (/^\.git(\/|\\|$)/.test(filename)) return

    callback()
  })
