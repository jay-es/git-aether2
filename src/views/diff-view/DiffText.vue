<template>
  <div class="diff-text">
    <div v-if="!difflines.length" class="simple-diff">
      <code class="simple-diff-col">No Diff</code>
    </div>
    <table v-else class="simple-diff">
      <tr v-for="(line, i) in difflines" :key="i">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { CurrentFile } from '@/store/diff'

interface DiffLine {
  text: string
  type: string
}

export default Vue.extend({
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      difflines: [] as DiffLine[]
    }
  },
  computed: {
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    }
  },
  watch: {
    currentFile: {
      deep: true,
      immediate: true,
      async handler() {
        if (!this.currentFile.path) {
          this.difflines = []
          return
        }

        // 新規ファイルの場合、一時的にワークツリーに登録してすぐ解除
        if (this.currentFile.isUntracked) {
          await this.repo.addN(this.currentFile.path)
          setTimeout(() => {
            this.repo.unstage(this.currentFile.path)
          })
        }

        const diffText = await this.repo.diff(
          this.currentFile.path,
          this.currentFile.isCached
        )

        if (!diffText) {
          this.difflines = []
          return
        }

        const classNames: { [x: string]: string } = {
          '+': 'ins',
          '-': 'del'
        }

        this.difflines = diffText
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
  },
  methods: {}
})
</script>

<style lang="scss" scoped>
.diff-text {
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
    border-top: 0.75em solid var(--diff-bgColor);
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
