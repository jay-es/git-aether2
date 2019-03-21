<template>
  <span
    v-jcontextmenu
    class="file-path"
    :class="{ 'is-current': isCurrent }"
    :title="file.path"
    @click="setCurrent(file, false)"
  >
    <span class="dir-name">{{ file.dirName }}</span>
    <span class="file-name">{{ file.fileName }}</span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { CurrentFile } from '@/store/diff'
import { File } from './DiffModalFileList.vue'

declare function unlink(...paths: string[]): Promise<void>

export default Vue.extend({
  props: {
    file: {
      type: Object as () => File,
      required: true
    },
    isCached: {
      type: Boolean,
      required: true
    },
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  computed: {
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    },
    isCurrent(): boolean {
      return (
        this.file.path === this.currentFile.path &&
        this.isCached === this.currentFile.isCached
      )
    }
  },
  watch: {},
  methods: {
    setCurrent(file: File) {
      this.$store.commit('diff/setCurrent', { file, isCached: this.isCached })
    },
    jContextMenuItems() {
      return [
        {
          label: 'Discard Changes',
          enabled: !this.file.hasStaged,
          click: () => {
            if (!confirm('Reset changes?')) return

            // 新規ファイルなら削除
            if (this.file.workTree === '?') {
              trash(this.repo.basePath, this.file.path)
              return
            }

            this.repo.checkout(this.file.path)
            // confirmのあとにfocusが起きるので更新される
          }
        },
        {
          label: 'Difftool',
          click: () => {
            const options = [this.file.path]

            if (this.file.hasStaged) {
              options.unshift('--cached')
            }

            this.repo.diffTool(options)
          }
        }
      ]
    }
  }
})
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
}
.list-title {
  margin: 0 0 0.25em;
}
.file-list {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;

  > li {
    position: relative;

    &:nth-last-child(n + 2) {
      margin-bottom: 0;
    }
  }
}
.file-status {
  display: inline-block;
  flex-shrink: 0;
  margin-right: 0.25em;
  width: 1em;
  text-align: center;
  cursor: pointer;
}
.file-path {
  display: inline-flex;
  width: 100%;
  max-width: calc(100% - 30px);
  cursor: pointer;
  vertical-align: top;

  &.is-current::before {
    content: '';
    position: absolute;
    top: 2px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    background-color: var(--diff-bgColor);
  }
  &.is-current::after {
    content: '▶';
    position: absolute;
    top: 0;
    right: -1px;
    bottom: 0;
    margin: auto;
    height: 1em;
    font-size: 10px;
    line-height: 1;
  }
  &:hover .file-name {
    text-decoration: underline;
  }
}
.dir-name {
  opacity: 0.75;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-name {
  font-weight: 500;
  white-space: nowrap;
}
</style>
