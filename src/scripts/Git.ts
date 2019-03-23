import simplegit from 'simple-git/promise'

declare function git(
  basePath: string,
  methodName?: string,
  ...args: any[]
): Promise<any>

export default class Git {
  public localBranchNames = [] as string[]
  public trackingBranchNames = [] as string[]
  public branchSummary = {} as simplegit.BranchSummary
  public statusResult = {} as simplegit.StatusResult
  public logText = ''

  constructor(public readonly basePath: string) {}

  // 配列の要素を消して、新しい要素を入れる
  private static replaceArray<T>(arr: T[], newArr: T[]) {
    arr.splice(0, arr.length, ...newArr)
  }

  // SimpleGit.rawを呼び出すシュガーメソッド
  private raw(commands: string | string[]): Promise<any> {
    return git(this.basePath, 'raw', commands)
  }

  addN(file: string): Promise<void> {
    return this.raw(['add', '-N', file])
  }

  async branch(): Promise<void> {
    this.branchSummary = await git(this.basePath, 'branch', ['--all'])

    const local = this.branchSummary.all.filter(v => !v.startsWith('remotes/'))
    const track = this.branchSummary.all
      .filter(v => v.startsWith('remotes/'))
      .map(v => v.substr(8))
    Git.replaceArray(this.localBranchNames, local)
    Git.replaceArray(this.trackingBranchNames, track)
  }

  checkout(what: string | string[]): Promise<void> {
    return git(this.basePath, 'checkout', what)
  }

  checkoutBranch(branchName: string, startPoint: string): Promise<void> {
    return git(this.basePath, 'checkoutBranch', branchName, startPoint)
  }

  delete(branchName: string, force?: boolean): Promise<void> {
    const option = force ? '-D' : '-d'
    return this.raw(['branch', option, branchName])
  }

  diff(file: string, isCached: boolean): Promise<string> {
    const options = isCached ? ['--cached', file] : [file]
    return git(this.basePath, 'diff', options)
  }

  diffTool(options: string[]): Promise<void> {
    return this.raw(['difftool', ...options])
  }

  fetch(options: simplegit.Options): Promise<simplegit.FetchResult>
  fetch(remote: string, branch: string): Promise<simplegit.FetchResult>
  fetch(...args: any[]): Promise<simplegit.FetchResult> {
    return git(this.basePath, 'fetch', ...args)
  }

  // getRemoteName(): Promise<string> {
  //   return git(this.basePath, 'remote', ['show'])
  // }

  merge(options: simplegit.Options | string[]): Promise<any> {
    return git(this.basePath, 'merge', options)
  }

  pull(
    remote: string,
    branch: string,
    options?: simplegit.Options
  ): Promise<simplegit.PullResult> {
    return git(this.basePath, 'pull', remote, branch, options)
  }

  push(
    remote: string,
    branch: string,
    options?: simplegit.Options
  ): Promise<void> {
    return git(this.basePath, 'push', remote, branch, options)
  }

  rename(branchName: string, newName: string): Promise<void> {
    return this.raw(['branch', '-m', branchName, newName])
  }

  /** fileを省略した場合は全ファイル対象 */
  stage(file?: string): Promise<void> {
    return this.raw(['add', file || '--all'])
  }

  async status(): Promise<void> {
    this.statusResult = await git(this.basePath, 'status')
  }

  /** fileを省略した場合は全ファイル対象 */
  async statusShort(file?: string): Promise<string> {
    const commands = file ? ['status', '--short', file] : ['status', '--short']
    return (await this.raw(commands)) || '' // 変更ファイルがないとnullが返ってくる
  }

  /** fileを省略した場合は全ファイル対象 */
  unstage(file?: string): Promise<void> {
    const commands = file ? ['reset', 'HEAD', file] : ['reset', 'HEAD']
    return this.raw(commands)
  }

  setLogText(text: any) {
    this.logText = text
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
