<template>
  <section class="diff-wrap">
    <div class="row">
      <file-list class="top-col" :repo="repo" />
      <diff-text class="top-col" :repo="repo" />
    </div>
    <div class="row">
      <diff-options class="bottom-col" />
      <commit-command class="bottom-col" :repo="repo" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import FileList from './FileList.vue'
import DiffOptions from './DiffOptions.vue'
import DiffText from './DiffText.vue'
import CommitCommand from './CommitCommand.vue'

export default Vue.extend({
  components: {
    FileList,
    DiffOptions,
    DiffText,
    CommitCommand
  },
  data() {
    const basePath = this.$route.query.basePath as string
    const repo: Git = new Git(basePath)
    repo.init()
    repo.status()

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
    window.addEventListener('focus', () => {
      this.repo.status()
      this.$store.commit('diff/setCurrentTimestamp')
    })
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
  width: 190px;
}
.bottom-col:nth-child(2) {
  flex-grow: 1;
}
</style>