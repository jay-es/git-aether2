<template>
  <table class="diff-table">
    <tr
      v-for="(line, i) in diffLines"
      :key="i"
      @mousedown.left="onMousedown(line.num)"
      @mouseup.left="onMouseup(line.num)"
      @contextmenu="popupMenu(line.num)"
      @mousedown.right.prevent
    >
      <template v-if="line.type === 'header' || line.type === 'hunk'">
        <td class="diff-table-col" :class="line.type" colspan="2">
          <code v-text="line.text" />
        </td>
      </template>
      <template v-else>
        <td class="diff-table-col _num" :class="line.type">
          <code v-text="line.text.charAt(0)" />
        </td>
        <td class="diff-table-col _txt" :class="line.type">
          <code v-text="line.text.substr(1)" />
        </td>
      </template>
    </tr>
  </table>
</template>

<script lang="ts">
import { remote } from 'electron'
import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import Git from '@/scripts/Git'
import { showError } from '@/scripts/electronDialog'
import { CurrentFile, DiffOptions } from '@/store/diff'
import { DiffLine } from './DiffDisp.vue'

export default Vue.extend({
  props: {
    diffLines: {
      type: Array as () => DiffLine[],
      required: true
    },
    orgDiffLines: {
      type: Array as () => DiffLine[],
      required: true
    },
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      rangeStart: 0,
      rangeEnd: 0
    }
  },
  computed: {
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    },
    diffOptions(): DiffOptions {
      return this.$store.state.diff.diffOptions
    }
  },
  methods: {
    onMousedown(i: number) {
      this.rangeStart = i
    },
    onMouseup(i: number) {
      if (i < this.rangeStart) {
        this.rangeEnd = this.rangeStart
        this.rangeStart = i
      } else {
        this.rangeEnd = i
      }
    },
    popupMenu(lineNo: number) {
      // Ignore Whitespace が有効なら終了
      if (this.diffOptions.ignoreWhitespace) {
        remote.Menu.buildFromTemplate([
          {
            label: 'Set Ignore Whitespace "None"',
            enabled: false
          }
        ]).popup()
        return
      }

      // 直前にあるHunkマーカー行
      let hunkStart = 0
      for (let i = lineNo; i > 0; i--) {
        if (this.orgDiffLines[i].type !== 'hunk') continue
        hunkStart = i
        break
      }

      // 直後にあるHunkマーカー行（なければ最終行）
      let hunkEnd = this.orgDiffLines.length
      for (let i = lineNo; i < hunkEnd; i++) {
        if (this.orgDiffLines[i].type !== 'hunk') continue
        hunkEnd = i
        break
      }

      // 選択範囲がなければ、現在の行を入れる
      const isRange = window.getSelection().type === 'Range'
      if (!isRange) {
        this.rangeStart = lineNo
        this.rangeEnd = lineNo
      }

      const stageLabel = this.currentFile.isCached ? 'Unstage' : 'Stage'
      const lineLabel = this.rangeStart === this.rangeEnd ? 'Line' : 'Lines'

      remote.Menu.buildFromTemplate([
        {
          label: `${stageLabel} Hunk For Commit`,
          enabled: hunkStart > 0,
          click: () =>
            this.stageHunk(
              this.orgDiffLines.slice(hunkStart, hunkEnd).map(line => line.text)
            )
        },
        {
          label: `${stageLabel} ${lineLabel} For Commit`,
          enabled: this.rangeStart >= hunkStart && this.rangeEnd <= hunkEnd,
          click: () => {
            const hunk = this.makeHunk(
              hunkStart,
              hunkEnd,
              this.rangeStart,
              this.rangeEnd,
              this.currentFile.isCached
            )
            this.stageHunk(hunk)
          }
        }
      ]).popup()
    },
    makeHunk(
      hunkStart: number,
      hunkEnd: number,
      rangeStart: number,
      rangeEnd: number,
      isCached: boolean
    ): string[] {
      const lines: string[] = []
      let del = 0
      let ins = 0

      this.orgDiffLines.forEach((line, i) => {
        // コード範囲外なら終了
        if (i <= hunkStart || i > hunkEnd) return

        // 差分がない
        if (!line.type) {
          del++
          ins++
          lines.push(line.text)
          return
        }

        // 選択範囲内
        if (i >= rangeStart && i <= rangeEnd) {
          if (line.type === 'del') {
            del++
          } else if (line.type === 'ins') {
            ins++
          }

          lines.push(line.text)
          return
        }

        // 選択範囲外は変更なしにする
        if (line.type === (isCached ? 'ins' : 'del')) {
          del++
          ins++
          lines.push(line.text.replace(/^[+-]/, ' '))
        }
      })

      // Hunkヘッダ作成
      const header = this.orgDiffLines[hunkStart].text.replace(
        /^(@@ -\d+,)\d+( \+\d+,)\d+( .*)$/,
        `$1${del}$2${ins}$3`
      )
      lines.unshift(header)

      return lines
    },
    async stageHunk(hunkLines: string[]) {
      // ファイルヘッダ追加
      hunkLines.unshift(
        ...this.orgDiffLines
          .filter(line => line.type === 'header')
          .map(line => line.text)
      )
      hunkLines.push('')

      // パッチファイル作成
      const tmpFilename = path.resolve(this.repo.basePath, 'tmp.patch')
      fs.writeFileSync(tmpFilename, hunkLines.join('\n'))

      try {
        await this.repo.stagePartial(tmpFilename, this.currentFile.isCached)
        this.$store.commit('diff/setCurrentTimestamp')
        this.repo.status()
      } catch (e) {
        showError(e.message, fs.readFileSync(tmpFilename, 'utf8'))
      }

      fs.unlinkSync(tmpFilename)
    }
  }
})
</script>

<style lang="scss" scoped>
.diff-table {
  min-width: 100%;
  border-collapse: collapse;
}
.diff-table-col {
  padding: 0 0.5em;
  white-space: pre;

  &.ins {
    background-color: var(--diff-bgColor-ins);
    color: var(--diff-fontColor-ins);
  }
  &.del {
    background-color: var(--diff-bgColor-del);
    color: var(--diff-fontColor-del);
  }
  &.hunk {
    background-color: var(--diff-bgColor-info);
    line-height: 1.6;
    opacity: 0.75;
  }

  // コード部分の1文字目（+/-/スペース）
  &._num {
    padding-right: 0;
    width: 1px;
    user-select: none;
    color: hsla(0, 0%, 50%, 0.75);
  }
  &._txt {
    padding-left: 3px;
  }
}
</style>
