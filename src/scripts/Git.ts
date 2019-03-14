import simplegit from 'simple-git/promise'

declare function git(
  basePath: string,
  methodName?: string,
  ...args: any[]
): Promise<any>

export default class {
  constructor(public readonly basePath: string) {}

  branch(
    options?: string[] | simplegit.Options
  ): Promise<simplegit.BranchSummary> {
    return git(this.basePath, 'branch', options)
  }

  checkout(what: string | string[]): Promise<void> {
    return git(this.basePath, 'checkout', what)
  }

  fetch(options?: simplegit.Options): Promise<simplegit.FetchResult> {
    return git(this.basePath, 'fetch', options)
  }

  status(): Promise<simplegit.StatusResult> {
    return git(this.basePath, 'status')
  }

  /** SimpleGitインスタンス作成時のエラーメッセージを取得 */
  async getInitializeError(): Promise<string> {
    try {
      await git(this.basePath)
      return ''
    } catch (e) {
      return e.message
    }
  }
}
