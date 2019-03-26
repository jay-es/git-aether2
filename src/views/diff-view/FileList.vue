<template>
  <div class="diff-file-list">
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
  watch: {
    'repo.statusResult': {
      deep: true,
      handler() {
        this.updateAllFileStatus()

        // タイムスタンプだけ更新
        this.$store.commit(
          'diff/setCurrentCached',
          this.$store.state.diff.currentFile.isCached
        )
      }
    }
  },
  methods: {
    // ファイルステータス取得系
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
    async updateAllFileStatus() {
      const res = await this.repo.statusShort()

      this.fileList = res
        .split('\n')
        .filter(v => v)
        .map(line => this.createStatus(line))
        .sort((a, b) => (a.path.toLowerCase() > b.path.toLowerCase() ? 1 : -1))
    },
    // 全部更新してしまうと反応が遅い & 連続クリックで表示くずれるので1ファイルだけのメソッドが必要
    async updateFileStatus(file: File, index: number) {
      const res = await this.repo.statusShort(file.path)
      this.$set(this.fileList, index, this.createStatus(res))
    },

    // ステージ変更系
    async stage(file: File, index: number) {
      // file.hasStaged = true
      // file.hasUnstaged = false
      await this.repo.stage(file.path)
      this.updateFileStatus(file, index)
      this.$store.commit('diff/setCurrentCached', true) // currentFile の isCached を変更
    },
    async unstage(file: File, index: number) {
      // file.hasStaged = false
      // file.hasUnstaged = true
      await this.repo.unstage(file.path)
      this.updateFileStatus(file, index)
      this.$store.commit('diff/setCurrentCached', false)
    },
    async stageAll() {
      await this.repo.stage()
      this.updateAllFileStatus()
      this.$store.commit('diff/setCurrentCached', true)
    },
    async unstageAll() {
      await this.repo.unstage()
      this.updateAllFileStatus()
      this.$store.commit('diff/setCurrentCached', false)
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
