<template>
  <div class="diff-disp-wrap" :class="tabClass">
    <div v-if="!diffLines.length" class="diff-disp">
      <code class="diff-disp-text">No Diff</code>
    </div>
    <div v-else-if="isTooLarge" class="diff-disp">
      <code class="diff-disp-text">Too Large Diff</code>
    </div>
    <div v-else-if="diffOptions.isSplit" class="split-wrap">
      <div
        v-for="(lines, side) of splitDiffLines"
        :key="side"
        ref="split"
        @scroll="setScroll($event.target.scrollTop, $event.target.scrollLeft)"
      >
        <diff-disp-table
          class="diff-disp"
          :diff-lines="lines"
          :org-diff-lines="diffLines"
          :repo="repo"
        />
      </div>
    </div>
    <diff-disp-table
      v-else
      class="diff-disp"
      :diff-lines="diffLines"
      :org-diff-lines="diffLines"
      :repo="repo"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { CurrentFile, DiffOptions } from '@/store/diff'
import DiffDispTable from './DiffDispTable.vue'
import createDiffLines, { DiffLine } from './createDiffLines'

export default Vue.extend({
  components: {
    DiffDispTable
  },
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      diffLines: [] as DiffLine[],
      isTooLarge: false
    }
  },
  computed: {
    tabClass(): string {
      return `tab-size-${this.diffOptions.tabSize}`
    },
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    },
    diffOptions(): DiffOptions {
      return this.$store.state.diff.diffOptions
    },
    splitDiffLines(): DiffLine[][] {
      const delLines: DiffLine[] = []
      const insLines: DiffLine[] = []

      // 行数を同じにする （少ない方に empty の行を足す）
      const equalize = (num?: number) => {
        while (delLines.length !== insLines.length) {
          const less = delLines.length > insLines.length ? insLines : delLines
          less.push({
            num: num !== undefined ? num : less[less.length - 1].num,
            text: ' ',
            type: 'empty'
          })
        }
      }

      this.diffLines.forEach((line, num, arr) => {
        // '\ No newline at end of file' は前の行に合わせる
        const lineType = (line.text[0] === '\\' ? arr[num - 1] : line).type

        if (lineType === 'del') {
          delLines.push(line)
          return
        }

        if (lineType === 'ins') {
          insLines.push(line)
          return
        }

        equalize(num)

        delLines.push(line)
        insLines.push(line)
      })

      equalize()

      return [delLines, insLines]
    }
  },
  watch: {
    'currentFile.path': function() {
      document.body.classList.add('in-progress')

      // スクロール位置をリセット
      const unwatch = this.$watch('diffLines', () => {
        this.$el.scrollTop = 0
        this.$el.scrollLeft = 0
        this.setScroll(0, 0)
        document.body.classList.remove('in-progress')
        unwatch()
      })
    },
    'currentFile.timestamp': 'generateDiff',
    'diffOptions.ignoreWhitespace': 'generateDiff'
  },
  methods: {
    async generateDiff() {
      const { isCached, isNewFile, isUntracked, path } = this.currentFile
      const { ignoreWhitespace } = this.diffOptions

      if (!path) {
        this.diffLines = []
        return
      }

      // 新規ファイルの場合、ワークツリーに登録
      if (isUntracked) {
        await this.repo.addN(path)
        setTimeout(() => {
          this.repo.status()
        })
      }

      const diffArgs = [
        isNewFile ? 'HEAD' : isCached ? '--cached' : '',
        ignoreWhitespace ? `-${ignoreWhitespace}` : ''
      ]

      const diffText = await this.repo.diff(path, diffArgs)
      const wordDiffText = await this.repo.diff(path, [
        '--word-diff=porcelain',
        '--word-diff-regex=\\w+|\\W',
        ...diffArgs
      ])

      this.isTooLarge = diffText.length > 1e6
      this.diffLines = createDiffLines(diffText, wordDiffText)
    },
    setScroll(scrollTop: number, scrollLeft: number) {
      const el = (this.$refs.split || []) as HTMLElement[]
      el.forEach(v => {
        v.scrollTop = scrollTop
        v.scrollLeft = scrollLeft
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.diff-disp-wrap {
  background-color: var(--diff-bgColor);
  border: 1px solid var(--borderColor);
  overflow: auto;
}
.split-wrap {
  display: flex;
  margin: 0 !important;
  height: 100%;

  > div {
    width: 50%;
    overflow-x: auto;
    overflow-y: scroll;
  }
}
.diff-disp {
  margin: 0.5em 0;
  font-size: 12px;
}
.diff-disp-text {
  padding: 0 0.5em;
  white-space: pre;
}

.tab-size-2 {
  tab-size: 2;
}
.tab-size-4 {
  tab-size: 4;
}
.tab-size-8 {
  tab-size: 8;
}
</style>
