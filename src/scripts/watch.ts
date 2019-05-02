import { watch } from 'fs'

export default (basePath: string, callback: () => void) => {
  let timerId = 0

  return watch(basePath, { recursive: true }, (eventType, filename) => {
    // Gitディレクトリは除外（startsWith だと .gitignore なども弾かれてしまうので正規表現）
    if (/^\.git(\/|\\|$)/.test(filename)) return

    // ブランチ切替時など、大量のファイル変更があると固まるので debounce
    clearTimeout(timerId)
    timerId = window.setTimeout(callback, 10)
  })
}
