<template>
  <div class="diff-file-list" tabindex="-1" @keydown="moveCursor($event.key)">
    <p class="list-title">Unstaged Changes</p>
    <ul class="j-list file-list">
      <li v-for="file of fileList" v-show="file.hasUnstaged" :key="file.path">
        <a class="file-status" @click="stage(file)">{{ file.working_dir }}</a>
        <list-item :file="file" :is-cached="false" :repo="repo" />
      </li>
    </ul>

    <div class="button-wrap">
      <a @click="stageAll">↓ Stage All</a>&emsp;
      <a @click="unstageAll">↑ Unstage All</a>
    </div>

    <p class="list-title">Staged Changes (Will Commit)</p>
    <ul class="j-list file-list">
      <li v-for="file of fileList" v-show="file.hasStaged" :key="file.path">
        <a class="file-status" @click="unstage(file)">{{ file.index }}</a>
        <list-item :file="file" :is-cached="true" :repo="repo" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git, { StatusResult } from '@/scripts/Git'
import { CurrentFile } from '@/store/diff'
import ListItem from './FileListItem.vue'

export interface File {
  index: string // ステージ済みの記号
  working_dir: string // 未ステージの記号
  path: string
  dirName: string
  fileName: string
  hasUnstaged: boolean // ステージ済みの変更があるか
  hasStaged: boolean // 未ステージの変更があるか
}

export default Vue.extend({
  components: {
    ListItem
  },
  props: {
    repo: {
      type: Object as () => Git,
      required: true
    }
  },
  data() {
    return {
      fileList: [] as File[]
    }
  },
  computed: {
    currentFile(): CurrentFile {
      return this.$store.state.diff.currentFile
    }
  },
  watch: {
    'repo.statusResult': function(newVal: StatusResult) {
      this.fileList = newVal.files
        .map(({ index, path, working_dir }) => {
          const lastIndex = path.lastIndexOf('/') // 最後のパス区切りの位置

          return {
            index,
            working_dir,
            path,
            dirName: lastIndex === -1 ? '' : path.substr(0, lastIndex),
            fileName: lastIndex === -1 ? path : path.substr(lastIndex),
            hasUnstaged: working_dir !== ' ',
            hasStaged: index !== ' ' && index !== '?'
          }
        })
        .sort((a, b) => (a.path.toLowerCase() > b.path.toLowerCase() ? 1 : -1))
    }
  },
  methods: {
    // 上下キーでカレントファイル変更
    moveCursor(key: string) {
      if (key !== 'ArrowUp' && key !== 'ArrowDown') return

      const activeProp = this.currentFile.isCached ? 'hasStaged' : 'hasUnstaged'
      const otherProp = this.currentFile.isCached ? 'hasUnstaged' : 'hasStaged'
      const activeList = this.fileList.filter(v => v[activeProp])
      const otherList = this.fileList.filter(v => v[otherProp])

      const currentIndex = activeList.findIndex(
        v => v.path === this.currentFile.path
      )

      let isCached = this.currentFile.isCached
      let targetFile: File

      if (key === 'ArrowUp') {
        if (currentIndex > 0) {
          // ひとつ上
          targetFile = activeList[currentIndex - 1]
        } else if (otherList.length) {
          // 別リストの一番下
          targetFile = otherList.pop() as File
          isCached = !isCached
        } else {
          // リストの一番下
          targetFile = activeList.pop() as File
        }
      } else {
        if (currentIndex < activeList.length - 1) {
          // ひとつ下
          targetFile = activeList[currentIndex + 1]
        } else if (otherList.length) {
          // 別リストの一番上
          targetFile = otherList.shift() as File
          isCached = !isCached
        } else {
          // リストの一番上
          targetFile = activeList.shift() as File
        }
      }

      this.$store.commit('diff/setCurrent', { file: targetFile, isCached })
    },

    /**
     * ステージ変更系
     */
    async stage(file: File) {
      file.hasStaged = true
      file.hasUnstaged = false

      // ステージ登録してステータス更新
      this.repo.stage(file.path) // status のタイムスタンプのため await をつけない
      await this.repo.status()

      // カレントに反映
      if (file.path === this.currentFile.path) {
        file = this.fileList.find(v => v.path === file.path) as File
        this.$store.commit('diff/setCurrent', { file, isCached: true })
      }
    },
    async unstage(file: File) {
      file.hasStaged = false
      file.hasUnstaged = true

      // ステージ解除してステータス更新
      this.repo.unstage(file.path) // status のタイムスタンプのため await をつけない
      await this.repo.status()

      // カレントに反映
      if (file.path === this.currentFile.path) {
        file = this.fileList.find(v => v.path === file.path) as File
        this.$store.commit('diff/setCurrent', { file, isCached: false })
      }
    },
    async stageAll() {
      // ステージ登録してステータス更新
      this.repo.stage() // status のタイムスタンプのため await をつけない
      await this.repo.status()

      // カレントに反映
      this.fileList.forEach(file => {
        if (file.path !== this.currentFile.path) return
        this.$store.commit('diff/setCurrent', { file, isCached: true })
      })
    },
    async unstageAll() {
      // ステージ解除してステータス更新
      this.repo.unstage() // status のタイムスタンプのため await をつけない
      await this.repo.status()

      // カレントに反映
      this.fileList.forEach(file => {
        if (file.path !== this.currentFile.path) return
        this.$store.commit('diff/setCurrent', { file, isCached: false })
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.diff-file-list {
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
    cursor: pointer;

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
}
.button-wrap {
  margin: 0.75em 0;
  padding-right: 1em;
  text-align: center;
}
</style>
