import Vue from 'vue'
import Git from '@/scripts/Git'

export default new Vue({
  data: {
    CREATE: 'CREATE',
    MERGE: 'MERGE',
    RENAME: 'RENAME'
  },
  methods: {
    openCreateModal(repo: Git) {
      this.$emit(this.CREATE, repo)
    },
    openMergeModal(repo: Git, branchName: string) {
      this.$emit(this.MERGE, repo, branchName)
    },
    openRenameModal(repo: Git, branchName: string) {
      this.$emit(this.RENAME, repo, branchName)
    }
  }
})
