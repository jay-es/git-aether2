<template>
  <span
    class="file-path"
    :class="{ 'is-current': isCurrent }"
    :title="file.path"
    @click="setCurrent"
    @contextmenu="popupMenu"
  >
    <span class="dir-name">{{ file.dirName }}</span>
    <span class="file-name">{{ file.fileName }}</span>
  </span>
</template>

<script lang="ts">
import { remote, shell } from 'electron'
import { resolve } from 'path'
import Vue from 'vue'
import Git from '@/scripts/Git'
import { confirmDialog } from '@/scripts/electronDialog'
import { CurrentFile } from '@/store/diff'
import { File } from './FileList.vue'

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
  methods: {
    setCurrent() {
      this.$store.commit('diff/setCurrent', {
        file: this.file,
        isCached: this.isCached
      })
    },
    popupMenu() {
      remote.Menu.buildFromTemplate([
        {
          label: 'Discard Changes',
          enabled: !this.file.hasStaged,
          click: () => {
            if (!confirmDialog('Reset changes?', this.file.path)) return

            // 画面の更新
            this.file.hasUnstaged = false
            if (this.isCurrent) {
              this.$store.commit('diff/resetCurrent')
            }

            const workDir = this.file.working_dir

            // 新規ファイルなら削除
            if (workDir === '?' || workDir === 'A') {
              const fullpath = resolve(this.repo.basePath, this.file.path)
              shell.moveItemToTrash(fullpath)
              this.repo.unstage(this.file.path)
              return
            }

            this.repo.checkout(this.file.path)
            // ダイアログのあとにfocusが起きるので更新される
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
      ]).popup()
    }
  }
})
</script>

<style lang="scss" scoped>
.file-path {
  display: inline-flex;
  width: 100%;
  max-width: calc(100% - 30px);
  vertical-align: top;
  overflow-x: hidden;

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
  white-space: nowrap;
}
.file-name {
  font-weight: 500;
  white-space: nowrap;
}
</style>
