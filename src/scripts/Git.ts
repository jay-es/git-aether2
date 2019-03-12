import simplegit from 'simple-git/promise'

declare function git(
  basePath: string,
  methodName: string,
  ...args: any[]
): Promise<any>

export default class {
  constructor(public readonly basePath: string) {}

  diffSummary(options?: string[]): Promise<string> {
    return git(this.basePath, 'diffSummary', options)
  }

  status(): Promise<simplegit.StatusResult> {
    return git(this.basePath, 'status')
  }
}
