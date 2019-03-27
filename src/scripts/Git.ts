import { existsSync, statSync } from 'fs'
import simplegit from 'simple-git/promise'

export default class Git {
  public localBranchNames = [] as string[]
  public trackingBranchNames = [] as string[]
  public branchSummary = {} as simplegit.BranchSummary
  public statusResult = {} as simplegit.StatusResult
  public logText = ''
  private git = {} as simplegit.SimpleGit

  constructor(public readonly basePath: string) {}

  // 配列の要素を消して、新しい要素を入れる
  private static replaceArray<T>(arr: T[], newArr: T[]) {
    arr.splice(0, arr.length, ...newArr)
  }

  // SimpleGit.rawを呼び出すシュガーメソッド
  private raw(commands: string | string[]): Promise<any> {
    return this.git.raw(commands)
  }

  addN(file: string): Promise<void> {
    return this.raw(['add', '-N', file])
  }

  async branch(): Promise<void> {
    this.branchSummary = await this.git.branch(['--all'])

    const local = this.branchSummary.all.filter(v => !v.startsWith('remotes/'))
    const track = this.branchSummary.all
      .filter(v => v.startsWith('remotes/'))
      .map(v => v.substr(8))
    Git.replaceArray(this.localBranchNames, local)
    Git.replaceArray(this.trackingBranchNames, track)
  }

  checkout(what: string | string[]): Promise<void> {
    return this.git.checkout(what)
  }

  checkoutBranch(branchName: string, startPoint: string): Promise<void> {
    return this.git.checkoutBranch(branchName, startPoint)
  }

  commit(message: string): Promise<simplegit.CommitSummary> {
    return this.git.commit(message)
  }

  delete(branchName: string, force?: boolean): Promise<void> {
    const option = force ? '-D' : '-d'
    return this.raw(['branch', option, branchName])
  }

  diff(file: string, options: string[]): Promise<string> {
    const commands = ['diff', ...options, '--', file].filter(v => v !== '')
    return this.raw(commands)
  }

  diffTool(options: string[]): Promise<void> {
    return this.raw(['difftool', ...options])
  }

  fetch(options: simplegit.Options): Promise<simplegit.FetchResult>
  fetch(remote: string, branch: string): Promise<simplegit.FetchResult>
  fetch(...args: any[]): Promise<simplegit.FetchResult> {
    return this.git.fetch(...args)
  }

  // getRemoteName(): Promise<string | void> {
  //   return this.git.remote(['show'])
  // }

  /** インスタンス初期化 */
  async init(): Promise<string> {
    // ディレクトリが存在するか確認
    if (!existsSync(this.basePath) || !statSync(this.basePath).isDirectory()) {
      return 'Not a directory'
    }

    this.git = simplegit(this.basePath).silent(true)

    // Gitリポジトリかどうか確認
    if (!(await this.git.checkIsRepo())) {
      return 'Not a git repository'
    }

    return ''
  }

  merge(options: simplegit.Options | string[]): Promise<any> {
    return this.git.merge(options)
  }

  pull(
    remote: string,
    branch: string,
    options?: simplegit.Options
  ): Promise<simplegit.PullResult> {
    return this.git.pull(remote, branch, options)
  }

  push(
    remote: string,
    branch: string,
    options?: simplegit.Options
  ): Promise<void> {
    return this.git.push(remote, branch, options)
  }

  rename(branchName: string, newName: string): Promise<void> {
    return this.raw(['branch', '-m', branchName, newName])
  }

  /** fileを省略した場合は全ファイル対象 */
  stage(file?: string): Promise<void> {
    return this.raw(['add', file || '--all'])
  }

  async status(): Promise<void> {
    this.statusResult = await this.git.status()
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
}
