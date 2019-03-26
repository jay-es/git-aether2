<template>
  <section class="diff-wrap">
    <file-list class="col" :repo="repo" />
    <diff-text class="col" :repo="repo" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Git from '@/scripts/Git'
import FileList from './FileList.vue'
import DiffText from './DiffText.vue'

export default Vue.extend({
  components: {
    FileList,
    DiffText
  },
  data() {
    const basePath = this.$route.query.basePath as string
    const repo = new Git(basePath)
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
    })
  }
})
</script>

<style lang="scss" scoped>
.diff-wrap {
  display: flex;
  height: calc(100vh - 16px);
}
.col:nth-child(1) {
  padding-bottom: 10px;
  width: 190px;
  min-width: 190px;
  resize: horizontal;
  overflow: auto;
}
.col:nth-child(2) {
  flex-grow: 1;
}
</style>
