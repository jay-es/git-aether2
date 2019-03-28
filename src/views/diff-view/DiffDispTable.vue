<template>
  <table>
    <tr
      v-for="(line, i) in diffLines"
      :key="i"
      @mousedown.left="onMousedown(i)"
      @mouseup.left="onMouseup(i)"
      @contextmenu="popupMenu(i)"
      @mousedown.right.prevent
    >
      <template v-if="line.type === 'header' || line.type === 'hunk'">
        <td class="simple-diff-col" :class="line.type" colspan="2">
          <code v-text="line.text" />
        </td>
      </template>
      <template v-else>
        <td class="simple-diff-col" :class="line.type">
          <code v-text="line.text.charAt(0)" />
        </td>
        <td class="simple-diff-col" :class="line.type">
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
      for (let i = lineNo; --i; ) {
        if (this.diffLines[i].type !== 'hunk') continue
        hunkStart = i
        break
      }

      // 直後にあるHunkマーカー行（なければ最終行）
      let hunkEnd = this.diffLines.length
      for (let i = lineNo; i < hunkEnd; i++) {
        if (this.diffLines[i].type !== 'hunk') continue
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
              this.diffLines.slice(hunkStart, hunkEnd).map(v => v.text)
            )
        },
        {
          label: `${stageLabel} ${lineLabel} For Commit`,
          enabled: this.rangeStart >= hunkStart && this.rangeEnd <= hunkEnd,
          click: () => {}
        }
      ]).popup()
    },
    async stageHunk(hunkLines: string[]) {
      // ヘッダー追加
      hunkLines.unshift(
        ...this.diffLines.filter(v => v.type === 'header').map(v => v.text)
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
        showError(e.message)
      }

      fs.unlinkSync(tmpFilename)
    }
  }
})
</script>

<style lang="scss" scoped>
.simple-diff-col {
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
  &:nth-last-child(2) {
    padding-right: 0;
    width: 1px;
    user-select: none;
    color: hsla(0, 0%, 50%, 0.75);
  }
  &:nth-child(2) {
    padding-left: 3px;
  }
}
</style>
