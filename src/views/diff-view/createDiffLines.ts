interface WordDiff {
  wordClass: string
  wordText: string
}

interface WordDiffLine {
  wordDiffs: WordDiff[]
  rawText: string
}

export interface DiffLine {
  num: number
  text: string
  type: string
  words?: WordDiff[]
}

const createBlocks = (wordDiffText: string) => {
  // 最初の Hunk がある行番号
  const firstHunkIndex = wordDiffText
    .split('\n')
    .findIndex(v => v.startsWith('@'))

  let hasChanges = false
  let wordDiffs: WordDiff[] = []
  let rawText: string = ''

  const delLines: WordDiffLine[] = wordDiffText
    .replace(/(?<=~\n)^\+[^+].*\n~\n/gm, '') // 行ins
    .replace(/^\+[^+].*\n~\n(?=\+)/gm, '') // 次の行に続くins
    .replace(/^\+[^+].*\n/gm, '') // 残りのins
    .split('\n')
    .slice(firstHunkIndex, -1)
    .reduce(
      (acc, line) => {
        const wordText = line.substr(1)

        if (line.startsWith(' ')) {
          // 変更なしブロック
          wordDiffs.push({ wordText, wordClass: '' })
          rawText += wordText
        } else if (line.startsWith('-')) {
          // del ブロック
          wordDiffs.push({ wordText, wordClass: 'word-del' })
          rawText += wordText
          hasChanges = true
        } else if (line === '~') {
          // del ブロックがある行だけ push
          if (hasChanges) {
            acc.push({ wordDiffs, rawText })
          }

          // リセット
          hasChanges = false
          wordDiffs = []
          rawText = ''
        }

        return acc
      },
      [] as WordDiffLine[]
    )

  const insLines: WordDiffLine[] = wordDiffText
    .replace(/(?<=~\n)^-[^-].*\n~\n/gm, '') // 行del
    .replace(/^-[^-].*\n~\n(?=-)/gm, '') // 次の行に続くdel
    .replace(/^-[^-].*\n/gm, '') // 残りのdel
    .split('\n')
    .slice(firstHunkIndex, -1)
    .reduce(
      (acc, line) => {
        const wordText = line.substr(1)

        if (line.startsWith(' ')) {
          // 変更なしブロック
          wordDiffs.push({ wordText, wordClass: '' })
          rawText += wordText
        } else if (line.startsWith('+')) {
          // ins ブロック
          wordDiffs.push({ wordText, wordClass: 'word-ins' })
          rawText += wordText
          hasChanges = true
        } else if (line === '~') {
          // ins ブロックがある行だけ push
          if (hasChanges) {
            acc.push({ wordDiffs, rawText })
          }

          // リセット
          hasChanges = false
          wordDiffs = []
          rawText = ''
        }

        return acc
      },
      [] as WordDiffLine[]
    )

  return [delLines, insLines]
}

export default (diffText: string, wordDiffText: string) => {
  const [delLines, insLines] = createBlocks(wordDiffText)

  return diffText
    .split('\n')
    .slice(0, -1)
    .map((text, num) => {
      const diffLine: DiffLine = {
        num,
        text,
        type: ''
      }

      if (text.startsWith('@@')) {
        diffLine.type = 'hunk'
      } else if (num < 5) {
        diffLine.type = 'header'
      } else if (text.charAt(0) === '-') {
        diffLine.type = 'del'

        // 行の内容が一致した場合のみ words に入れる （部分挿入した行は delLines に入っていないので）
        if (delLines[0] && delLines[0].rawText === text.substr(1)) {
          const wordDiffLine = delLines.shift()

          if (wordDiffLine) {
            diffLine.words = wordDiffLine.wordDiffs
          }
        }
      } else if (text.charAt(0) === '+') {
        diffLine.type = 'ins'

        // 同上
        if (insLines[0] && insLines[0].rawText === text.substr(1)) {
          const wordDiffLine = insLines.shift()

          if (wordDiffLine) {
            diffLine.words = wordDiffLine.wordDiffs
          }
        }
      }

      return diffLine
    })
}
