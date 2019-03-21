/** OSのコマンドを実行 */
declare function exec(cwd: string, command: string): Promise<void>

/** ゴミ箱に移動 */
declare function trash(...paths: string[]): Promise<void>
