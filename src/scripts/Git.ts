import simplegit from 'simple-git/promise'

declare function git(
  basePath: string,
  methodName: string,
  ...args: any[]
): Promise<any>

declare function exec(cwd: string, commandLine: string): Promise<void>

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

  execCommand(commandLine: string): Promise<void> {
    return exec(this.basePath, commandLine)
  }
}
