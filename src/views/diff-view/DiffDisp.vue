<template>
  <div class="diff-disp-wrap" :class="tabClass">
    <div v-if="!diffLines.length" class="diff-disp">
      <code class="diff-disp-text">No Diff</code>
    </div>
    <div v-else-if="isTooLarge" class="diff-disp">
      <code class="diff-disp-text">Too Large Diff</code>
    </div>
    <diff-disp-table
      v-else
      class="diff-disp"
      :diff-lines="diffLines"
      :repo="repo"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { CurrentFile, DiffOptions } from '@/store/diff'
import DiffDispTable from './DiffDispTable.vue'

export interface DiffLine {
  text: string
  type: string
}

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
    }
  },
  watch: {
    'currentFile.path': function() {
      document.body.classList.add('in-progress')

      // スクロール位置をリセット
      const unwatch = this.$watch('diffLines', () => {
        this.$el.scrollTop = 0
        this.$el.scrollLeft = 0
        document.body.classList.remove('in-progress')
        unwatch()
      })
    },
    'currentFile.timestamp': 'generateDiff',
    'diffOptions.ignoreWhitespace': 'generateDiff'
  },
  methods: {
    async generateDiff() {
      const { isCached, isUntracked } = this.currentFile
      const { ignoreWhitespace } = this.diffOptions

      // 新規ファイルの場合、一時的にワークツリーに登録してすぐ解除
      if (isUntracked) {
        await this.repo.addN(this.currentFile.path)
        setTimeout(() => {
          this.repo.unstage(this.currentFile.path)
        })
      }

      const diffText = await this.repo.diff(this.currentFile.path, [
        isUntracked ? 'HEAD' : isCached ? '--cached' : '',
        ignoreWhitespace ? `-${ignoreWhitespace}` : ''
      ])

      const classNames: { [x: string]: string } = {
        '+': 'ins',
        '-': 'del'
      }

      this.isTooLarge = diffText.length > 1e6
      this.diffLines = diffText
        .split('\n')
        .slice(0, -1)
        .map((text: string, i: number) => {
          if (text.startsWith('@@')) {
            return {
              text,
              type: 'hunk'
            }
          }

          if (i < 5) {
            return {
              text,
              type: 'header'
            }
          }

          return {
            text,
            type: classNames[text.charAt(0)] || ''
          }
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
