<template>
  <div class="diff-disp" :class="tabClass">
    <div v-if="!diffLines.length" class="simple-diff">
      <code class="simple-diff-col">No Diff</code>
    </div>
    <div v-else-if="isTooMany" class="simple-diff">
      <code class="simple-diff-col">Too Many Diffs</code>
    </div>
    <diff-disp-table
      v-else
      class="simple-diff"
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
      diffLines: [] as DiffLine[]
    }
  },
  computed: {
    isTooMany(): boolean {
      return this.diffLines.reduce((acc, v) => acc + v.text.length, 0) > 1e6
    },
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
    currentFile: {
      deep: true,
      handler() {
        this.generateDiff()
      }
    },
    'currentFile.path': function() {
      // スクロール位置をリセット
      this.$el.scrollTop = 0
      this.$el.scrollLeft = 0
    },
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

      if (!diffText) {
        this.diffLines = []
        return
      }

      const classNames: { [x: string]: string } = {
        '+': 'ins',
        '-': 'del'
      }

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
.diff-disp {
  background-color: var(--diff-bgColor);
  border: 1px solid var(--borderColor);
  overflow: auto;
}
.simple-diff {
  margin: 0.5em 0;
  border-collapse: collapse;
  min-width: 100%;
  font-size: 12px;
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

.simple-diff-col {
  padding: 0 0.5em;
  white-space: pre;
}
</style>