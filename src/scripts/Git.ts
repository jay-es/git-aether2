import simplegit from 'simple-git/promise'

declare function git(
  basePath: string,
  methodName?: string,
  ...args: any[]
): Promise<any>

export default class Git {
  public branchSummary = {} as simplegit.BranchSummary
  public statusResult = {} as simplegit.StatusResult

  constructor(public readonly basePath: string) {}

  async branch(): Promise<void> {
    this.branchSummary = await git(this.basePath, 'branch', ['--all'])
  }

  checkout(what: string | string[]): Promise<void> {
    return git(this.basePath, 'checkout', what)
  }

  fetch(options?: simplegit.Options): Promise<simplegit.FetchResult> {
    return git(this.basePath, 'fetch', options)
  }

  async status(): Promise<void> {
    this.statusResult = await git(this.basePath, 'status')
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
