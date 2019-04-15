<template>
  <div class="diff-file-list" tabindex="-1" @keydown="moveCursor($event.key)">
    <p class="list-title">Unstaged Changes</p>
    <ul class="j-list file-list">
      <li
        v-for="(file, i) of fileList"
        v-show="file.hasUnstaged"
        :key="file.path"
      >
        <a class="file-status" @click="stage(file, i)">{{ file.workTree }}</a>
        <list-item
          :file="file"
          :is-cached="false"
          :repo="repo"
          @change="updateAllFileStatus"
        />
      </li>
    </ul>

    <div class="button-wrap">
      <a @click="stageAll">↓ Stage All</a>&emsp;
      <a @click="unstageAll">↑ Unstage All</a>
    </div>

    <p class="list-title">Staged Changes (Will Commit)</p>
    <ul class="j-list file-list">
      <li
        v-for="(file, i) of fileList"
        v-show="file.hasStaged"
        :key="file.path"
      >
        <a class="file-status" @click="unstage(file, i)">{{ file.index }}</a>
        <list-item
          :file="file"
          :is-cached="true"
          :repo="repo"
          @change="updateAllFileStatus"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import { CurrentFile } from '@/store/diff'
import ListItem from './FileListItem.vue'

export interface File {
  index: string // ステージ済みの記号
  workTree: string // 未ステージの記号
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
    'repo.statusResult': {
      deep: true,
      handler() {
        this.updateAllFileStatus()
      }
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
     * ステータス更新系
     */
    // ステータス文字列をFileの形式に変換
    createStatus(line: string): File {
      const index = line.charAt(0)
      const workTree = line.charAt(1)
      const path = line.substr(3).trim() // 1行の場合、最後に改行文字があるので
      const lastIndex = path.lastIndexOf('/') // 最後のパス区切りの位置

      return {
        index,
        workTree,
        path,
        dirName: lastIndex === -1 ? '' : path.substr(0, lastIndex),
        fileName: lastIndex === -1 ? path : path.substr(lastIndex),
        hasUnstaged: workTree !== ' ',
        hasStaged: index !== ' ' && index !== '?'
      }
    },
    // 全ファイルステータス更新
    async updateAllFileStatus() {
      const res = await this.repo.statusShort()

      this.fileList = res
        .split('\n')
        .filter(v => v)
        .map(line => this.createStatus(line))
        .sort((a, b) => (a.path.toLowerCase() > b.path.toLowerCase() ? 1 : -1))
    },
    // 1ファイルステータス更新 （毎回全ファイル更新してしまうと反応が遅い & 連続クリックで表示くずれる）
    async updateFileStatus(file: File, index: number) {
      const res = await this.repo.statusShort(file.path)
      return this.$set(this.fileList, index, this.createStatus(res))
    },

    /**
     * ステージ変更系
     */
    async stage(file: File, index: number) {
      // ステージ登録してステータス更新
      await this.repo.stage(file.path)
      const saved = await this.updateFileStatus(file, index)
      this.repo.status()

      // カレントに反映
      if (file.path === this.currentFile.path) {
        this.$store.commit('diff/setCurrent', { file: saved, isCached: true })
      }
    },
    async unstage(file: File, index: number) {
      // ステージ解除してステータス更新
      await this.repo.unstage(file.path)
      const saved = await this.updateFileStatus(file, index)
      this.repo.status()

      // カレントに反映
      if (file.path === this.currentFile.path) {
        this.$store.commit('diff/setCurrent', { file: saved, isCached: false })
      }
    },
    async stageAll() {
      // ステージ登録してステータス更新
      await this.repo.stage()
      await this.updateAllFileStatus()
      this.repo.status()

      // カレントに反映
      this.fileList.forEach(file => {
        if (file.path !== this.currentFile.path) return
        this.$store.commit('diff/setCurrent', { file, isCached: true })
      })
    },
    async unstageAll() {
      // ステージ解除してステータス更新
      await this.repo.unstage()
      await this.updateAllFileStatus()
      this.repo.status()

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
.button-wrap {
  margin: 0.75em 0;
  padding-right: 1em;
  text-align: center;
}
</style>
