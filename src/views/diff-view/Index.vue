<template>
  <section class="diff-wrap">
    <div class="row">
      <file-list class="top-col" :repo="repo" />
      <diff-disp class="top-col" :repo="repo" />
    </div>
    <div class="row">
      <diff-options class="bottom-col" />
      <commit-command class="bottom-col" :repo="repo" />
    </div>
    <create-branch-modal />
    <merge-branch-modal />
    <rename-branch-modal />
  </section>
</template>

<script lang="ts">
import { remote } from 'electron'
import Vue from 'vue'
import Git from '@/scripts/Git'
import watch from '@/scripts/watch'
import CreateBranchModal from '@/components/modals/CreateBranchModal.vue'
import MergeBranchModal from '@/components/modals/MergeBranchModal.vue'
import RenameBranchModal from '@/components/modals/RenameBranchModal.vue'
import FileList from './FileList.vue'
import DiffOptions from './DiffOptions.vue'
import DiffDisp from './DiffDisp.vue'
import CommitCommand from './CommitCommand.vue'

export default Vue.extend({
  components: {
    FileList,
    DiffOptions,
    DiffDisp,
    CommitCommand,
    CreateBranchModal,
    MergeBranchModal,
    RenameBranchModal
  },
  data() {
    const basePath = this.$route.query.basePath as string
    const repo: Git = new Git(basePath)
    repo.init()
    repo.status()
    repo.branch()

    return {
      repo
    }
  },
  watch: {
    'repo.statusResult.current': function(newVal) {
      document.title = `${this.repo.basePath} (${newVal})`
    }
  },
  mounted() {
    window.addEventListener('focus', this.refresh)

    // ファイルが変更されたら更新
    const watcher = watch(this.repo.basePath, this.refresh)

    // ホットリロードで複数回登録されてしまうので、都度解除する
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('focus', this.refresh)
      watcher.close()
    })

    // クローズ時にウィンドウ位置を保存
    window.addEventListener('beforeunload', () => {
      const win = remote.getCurrentWindow()
      localStorage.setItem('winPos:diff', JSON.stringify(win.getBounds()))
    })
  },
  methods: {
    refresh() {
      this.repo.status()
      this.repo.branch()
      this.$store.commit('diff/setCurrentTimestamp')
    }
  }
})
</script>

<style lang="scss" scoped>
.diff-wrap {
  height: calc(100vh - 16px);
}
.row {
  $bottom-height: 82px;
  display: flex;

  &:nth-child(1) {
    padding-bottom: 0.5em;
    height: calc(100% - 0.5em - #{$bottom-height});
  }
  &:nth-child(2) {
    height: $bottom-height;
  }
}

.top-col:nth-child(1) {
  padding-bottom: 10px;
  width: 190px;
  min-width: 190px;
  resize: horizontal;
  overflow: auto;
}
.top-col:nth-child(2) {
  flex-grow: 1;
}
.bottom-col:nth-child(1) {
  width: 260px;
}
.bottom-col:nth-child(2) {
  flex-grow: 1;
}
</style>
