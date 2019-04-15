import { existsSync, statSync } from 'fs'
import simplegit from 'simple-git/promise'

export default class Git {
  public localBranchNames = [] as string[]
  public trackingBranchNames = [] as string[]
  public branchSummary = {} as simplegit.BranchSummary
  public statusResult = {} as simplegit.StatusResult
  public logText = ''
  private git = {} as simplegit.SimpleGit

  constructor(
    public readonly basePath: string,
    public readonly github?: string
  ) {}

  // 配列の要素を消して、新しい要素を入れる
  private static replaceArray<T>(arr: T[], newArr: T[]) {
    arr.splice(0, arr.length, ...newArr)
  }

  // SimpleGit.rawを呼び出すシュガーメソッド
  private raw(commands: string[]): Promise<any> {
    return this.git.raw(commands.filter(v => v !== ''))
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

  commit(message: string): Promise<simplegit.CommitSummary> {
    return this.git.commit(message)
  }

  delete(branchName: string, force?: boolean): Promise<void> {
    const option = force ? '-D' : '-d'
    return this.raw(['branch', option, branchName])
  }

  async diff(file: string, options: string[]): Promise<string> {
    // 差分がないとnullが返ってくる
    const res = await this.raw(['diff', ...options, '--', file])
    return res || ''
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

  stagePartial(file: string, isCached: boolean): Promise<void> {
    return this.raw([
      'apply',
      '--cached',
      '--ignore-whitespace',
      isCached ? '-R' : '',
      file
    ])
  }

  async status(): Promise<void> {
    this.statusResult = await this.git.status()
  }

  /** fileを省略した場合は全ファイル対象 */
  async statusShort(file?: string): Promise<string> {
    // 変更ファイルがないとnullが返ってくる
    const res = await this.raw(['status', '--short', file || ''])
    return res || ''
  }

  /** fileを省略した場合は全ファイル対象 */
  unstage(file?: string): Promise<void> {
    return this.raw(['reset', 'HEAD', file || ''])
  }

  setLogText(text: any) {
    this.logText = text
  }
}
