<template>
  <dialog class="j-dialog">
    <header class="j-dialog-header">
      <b>Diff</b> &ndash; {{ repo.basePath }} ({{ repo.statusResult.current }})
    </header>

    <section class="diff-wrap">
      <file-list class="col" :repo="repo" />
    </section>

    <footer class="j-dialog-footer">
      <button @click="closeModal">Close</button>
    </footer>
  </dialog>
</template>

<script lang="ts">
import Git from '@/scripts/Git'
import ModalBase from './ModalBase'
import modalController from './modalController'
import FileList from './DiffModalFileList.vue'

export default ModalBase.extend({
  components: {
    FileList
  },
  data() {
    return {
      modalType: modalController.DIFF,
      repo: new Git('')
    }
  },
  methods: {
    init(repo: Git) {
      this.repo = repo
      this.openModal()
    },
    reset() {
      this.$store.commit('diff/resetCurrent')
    }
  }
})
</script>

<style lang="scss" scoped>
.j-dialog {
  width: calc(100vw - 2em);
  height: calc(100vh - 2em);
}
.diff-wrap {
  display: flex;
  height: calc(100% - 60px);
}
.col:nth-child(1) {
  padding-right: 10px;
  min-width: 190px;
  resize: horizontal;
  overflow: auto;
}
.col:nth-child(2) {
  flex-grow: 1;
}
</style>
